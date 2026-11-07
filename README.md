# 특별관 장르 적합도 대시보드

김지민 · CJ 4DPLEX 사전과제

한국 KOBIS 데이터로 특별관(4D·ScreenX)의 좌석점유율을 추정해 잘 맞는 작품의 특징을 찾고, 해외 박스오피스 트렌드에 대입한 분석 대시보드입니다.

## 폴더 구성
- `index.html` : 대시보드 페이지
- `assets/dash.js` : 데이터를 읽고 차트를 그리는 작은 런타임 (d3 v7 사용)
- `data/*.csv` : 분석 결과 데이터
  - `kr_format.csv` 포맷별 좌석점유율 배수 요약 (KOBIS)
  - `kr_buckets.csv` 장르 묶음별 4D·ScreenX 점유율 배수 (KOBIS)
  - `kr_films.csv` 작품별 점유율 배수 108편 (KOBIS)
  - `kr_tests.csv` 통계 검정 결과 (보정 후 유의 여부 포함)
  - `kr_sensitivity.csv` 좌석 추정 민감도 (±10·20%, 부트스트랩)
  - `global_share.csv` 전 세계 Top50 장르 비중 (Box Office Mojo)
  - `market_year.csv` 해외 12개 시장 연도별 장르 비중

## GitHub Pages로 올리기
1. 이 폴더의 파일을 저장소 맨 위(루트)에 올립니다.
2. 저장소 Settings → Pages → Branch를 `main` / `/ (root)`로 저장합니다.
3. 잠시 뒤 `https://<아이디>.github.io/<저장소이름>/` 에서 열립니다.

로컬에서 확인할 때는 파일을 직접 열지 말고 간단한 서버로 여세요 (CSV를 읽기 때문):
`python -m http.server` 실행 후 http://localhost:8000

## 좌석점유율 계산
- 점유율 = 관객 ÷ 배정 좌석. 배수 = 특별관 점유율 ÷ 같은 영화 일반관 점유율
- 영화 전체 배정 좌석: KOBIS 영화별 일자별 통계
- 포맷별 좌석: KOBIS 영화상영관 정보(전국 상설 602곳, 상영관 3,356개)에서 이름에 포맷이 적힌 상영관 평균 — ScreenX 158석, 4D 121석, IMAX 303석
