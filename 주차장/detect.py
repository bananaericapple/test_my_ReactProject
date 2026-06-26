#!/usr/bin/env python3
"""
ParkView - 미니어처 주차장 실시간 차량 감지 시스템

사용법:
    python3 detect.py                 # 일반 실행 (감지 + Firebase 전송)
    python3 detect.py --calibrate     # 마우스로 주차 칸 좌표 지정 모드
    python3 detect.py --no-firebase   # Firebase 전송 없이 로컬 테스트만

개인정보 보호:
    - 영상 원본(프레임)은 Firebase나 외부로 전송되지 않습니다.
    - Firebase에는 각 칸의 점유 여부(occupied: true/false)만 저장됩니다.
"""

import argparse
import json
import sys
import time
from pathlib import Path

import cv2
import numpy as np

CONFIG_PATH = Path(__file__).parent / "config.json"


def load_config():
    if not CONFIG_PATH.exists():
        print(f"[오류] {CONFIG_PATH} 파일이 없습니다.")
        sys.exit(1)
    with open(CONFIG_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def save_config(config):
    with open(CONFIG_PATH, "w", encoding="utf-8") as f:
        json.dump(config, f, ensure_ascii=False, indent=2)


def iter_spots(config):
    """config의 모든 칸을 (floor_name, spot_dict) 형태로 순회."""
    for floor in config["floors"]:
        for spot in floor["spots"]:
            yield floor["name"], spot


SPOT_COLORS = {
    "normal": (255, 255, 255),
    "woman": (255, 105, 180),
    "disabled": (255, 165, 0),
}


# ---------------------------------------------------------------------------
# 캘리브레이션 모드: 마우스로 주차 칸 좌표 지정
# ---------------------------------------------------------------------------

class Calibrator:
    def __init__(self, config):
        self.config = config
        self.drawing = False
        self.start_point = None
        self.current_rect = None
        self.new_spots = []  # 이번 세션에서 새로 그린 칸들

    def mouse_callback(self, event, x, y, flags, param):
        if event == cv2.EVENT_LBUTTONDOWN:
            self.drawing = True
            self.start_point = (x, y)
        elif event == cv2.EVENT_MOUSEMOVE and self.drawing:
            self.current_rect = (self.start_point[0], self.start_point[1], x, y)
        elif event == cv2.EVENT_LBUTTONUP:
            self.drawing = False
            x0, y0 = self.start_point
            x1, y1 = x, y
            rx, ry = min(x0, x1), min(y0, y1)
            rw, rh = abs(x1 - x0), abs(y1 - y0)
            self.current_rect = None
            if rw > 5 and rh > 5:
                self._prompt_new_spot(rx, ry, rw, rh)

    def _prompt_new_spot(self, x, y, w, h):
        print("\n새 칸 정보를 입력하세요 (터미널 입력).")
        spot_id = input("  칸 ID (예: B1-05): ").strip()
        if not spot_id:
            print("  취소됨 (ID 없음)")
            return
        floor_name = input("  층 이름 (예: B1): ").strip() or "B1"
        spot_type = input("  종류 [normal/woman/disabled] (기본 normal): ").strip() or "normal"
        if spot_type not in SPOT_COLORS:
            spot_type = "normal"

        floor = None
        for f in self.config["floors"]:
            if f["name"] == floor_name:
                floor = f
                break
        if floor is None:
            floor = {"name": floor_name, "spots": []}
            self.config["floors"].append(floor)

        floor["spots"].append(
            {"id": spot_id, "type": spot_type, "x": x, "y": y, "w": w, "h": h}
        )
        print(f"  -> 추가됨: {floor_name}/{spot_id} ({spot_type}) @ ({x},{y},{w},{h})")

    def run(self, cam_index, width, height):
        cap = cv2.VideoCapture(cam_index)
        cap.set(cv2.CAP_PROP_FRAME_WIDTH, width)
        cap.set(cv2.CAP_PROP_FRAME_HEIGHT, height)
        if not cap.isOpened():
            print("[오류] 웹캠을 열 수 없습니다.")
            sys.exit(1)

        win = "Calibrate (드래그로 칸 그리기 / s: 저장 / q: 종료)"
        cv2.namedWindow(win)
        cv2.setMouseCallback(win, self.mouse_callback)

        print("드래그로 사각형을 그려 주차 칸을 추가하세요.")
        print("'s' 키: config.json에 저장 / 'q' 키: 저장 없이 종료")

        while True:
            ok, frame = cap.read()
            if not ok:
                continue

            for floor in self.config["floors"]:
                for spot in floor["spots"]:
                    x, y, w, h = spot["x"], spot["y"], spot["w"], spot["h"]
                    color = SPOT_COLORS.get(spot["type"], (255, 255, 255))
                    cv2.rectangle(frame, (x, y), (x + w, y + h), color, 2)
                    cv2.putText(frame, spot["id"], (x, y - 5),
                                cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 1)

            if self.current_rect:
                x0, y0, x1, y1 = self.current_rect
                cv2.rectangle(frame, (x0, y0), (x1, y1), (0, 255, 255), 2)

            cv2.imshow(win, frame)
            key = cv2.waitKey(1) & 0xFF
            if key == ord("s"):
                save_config(self.config)
                print(f"[저장됨] {CONFIG_PATH}")
            elif key == ord("q"):
                break

        cap.release()
        cv2.destroyAllWindows()


# ---------------------------------------------------------------------------
# Firebase 연동
# ---------------------------------------------------------------------------

class FirebaseClient:
    def __init__(self, config):
        import firebase_admin
        from firebase_admin import credentials, db

        fb_cfg = config["firebase"]
        key_path = Path(__file__).parent / fb_cfg["serviceAccountKeyPath"]
        if not key_path.exists():
            print(f"[오류] 서비스 계정 키 파일이 없습니다: {key_path}")
            print("setup_guide.md 를 참고해 Firebase 서비스 계정 키를 발급받으세요.")
            sys.exit(1)
        if "YOUR_PROJECT_ID" in fb_cfg.get("databaseURL", ""):
            print("[오류] config.json의 firebase.databaseURL을 실제 값으로 변경하세요.")
            sys.exit(1)

        cred = credentials.Certificate(str(key_path))
        firebase_admin.initialize_app(cred, {"databaseURL": fb_cfg["databaseURL"]})
        self.ref = db.reference("parking")

    def push(self, floors_status, empty_count, total_count):
        payload = {
            "floors": floors_status,
            "summary": {
                "empty": empty_count,
                "total": total_count,
                "lastUpdated": {".sv": "timestamp"},
            },
        }
        self.ref.set(payload)


# ---------------------------------------------------------------------------
# 감지 로직
# ---------------------------------------------------------------------------

def boxes_overlap(box_a, box_b, threshold):
    """box = (x, y, w, h). box_a 영역 대비 교집합 비율이 threshold를 넘으면 True."""
    ax, ay, aw, ah = box_a
    bx, by, bw, bh = box_b

    ix1, iy1 = max(ax, bx), max(ay, by)
    ix2, iy2 = min(ax + aw, bx + bw), min(ay + ah, by + bh)
    iw, ih = max(0, ix2 - ix1), max(0, iy2 - iy1)
    inter_area = iw * ih
    if inter_area <= 0:
        return False

    spot_area = aw * ah
    return (inter_area / spot_area) >= threshold


def run_detection(config, use_firebase=True):
    from ultralytics import YOLO

    det_cfg = config["detection"]
    cam_cfg = config["camera"]

    print("YOLOv8 모델 로딩 중...")
    model = YOLO(det_cfg["model"])
    vehicle_class_ids = set(det_cfg["vehicleClassIds"])
    confidence = det_cfg["confidence"]
    overlap_threshold = det_cfg.get("overlapThreshold", 0.3)
    update_interval = det_cfg.get("updateIntervalSeconds", 0.5)

    fb_client = None
    if use_firebase:
        print("Firebase 연결 중...")
        fb_client = FirebaseClient(config)
        print("Firebase 연결 완료.")

    cap = cv2.VideoCapture(cam_cfg["deviceIndex"])
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, cam_cfg["width"])
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, cam_cfg["height"])
    if not cap.isOpened():
        print("[오류] 웹캠을 열 수 없습니다.")
        sys.exit(1)

    last_push_time = 0.0
    print("감지 시작. 'q' 키를 누르면 종료합니다.")

    while True:
        ok, frame = cap.read()
        if not ok:
            continue

        results = model.predict(frame, conf=confidence, verbose=False)[0]
        vehicle_boxes = []
        for box in results.boxes:
            cls_id = int(box.cls[0])
            if cls_id not in vehicle_class_ids:
                continue
            x1, y1, x2, y2 = box.xyxy[0].tolist()
            vehicle_boxes.append((x1, y1, x2 - x1, y2 - y1))

        floors_status = {}
        empty_count = 0
        total_count = 0

        for floor_name, spot in iter_spots(config):
            spot_box = (spot["x"], spot["y"], spot["w"], spot["h"])
            occupied = any(
                boxes_overlap(spot_box, vb, overlap_threshold) for vb in vehicle_boxes
            )
            total_count += 1
            if not occupied:
                empty_count += 1

            floors_status.setdefault(floor_name, {})[spot["id"]] = {
                "type": spot["type"],
                "occupied": occupied,
            }

            color = (0, 0, 255) if occupied else (0, 200, 0)
            x, y, w, h = spot_box
            x, y, w, h = int(x), int(y), int(w), int(h)
            cv2.rectangle(frame, (x, y), (x + w, y + h), color, 2)
            label = f"{spot['id']} {'주차됨' if occupied else '빈칸'}"
            cv2.putText(frame, label, (x, y - 5),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 1)

        for vb in vehicle_boxes:
            x, y, w, h = [int(v) for v in vb]
            cv2.rectangle(frame, (x, y), (x + w, y + h), (255, 200, 0), 1)

        cv2.putText(frame, f"빈칸 {empty_count}/{total_count}", (10, 30),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 255, 255), 2)

        now = time.time()
        if fb_client and (now - last_push_time) >= update_interval:
            fb_client.push(floors_status, empty_count, total_count)
            last_push_time = now

        cv2.imshow("ParkView Detection (q: 종료)", frame)
        if cv2.waitKey(1) & 0xFF == ord("q"):
            break

    cap.release()
    cv2.destroyAllWindows()


def main():
    parser = argparse.ArgumentParser(description="ParkView 주차 감지 시스템")
    parser.add_argument("--calibrate", action="store_true", help="마우스로 칸 좌표 지정 모드")
    parser.add_argument("--no-firebase", action="store_true", help="Firebase 전송 없이 로컬 테스트")
    args = parser.parse_args()

    config = load_config()

    if args.calibrate:
        Calibrator(config).run(
            config["camera"]["deviceIndex"],
            config["camera"]["width"],
            config["camera"]["height"],
        )
    else:
        run_detection(config, use_firebase=not args.no_firebase)


if __name__ == "__main__":
    main()
