# ERD (Entity-Relationship Diagram) — HomeOne 전체

> 프로젝트명: HomeOne — B2G2C 분양 정보 통합 플랫폼  
> 작성자: #2 백엔드 개발자  
> 작성일: 2026-08-27  
> DB: MariaDB 11.2 / 공유 DB (`lecture_db`)

---

## draw.io 사용법

1. `app.diagrams.net` 접속 → **새 다이어그램** → 빈 화면
2. 상단 메뉴 **Extras → Edit Diagram** 클릭
3. 아래 XML 전체 복사 → 붙여넣기 → **OK**
4. 그러면 테이블 4개 + 관계선이 자동으로 그려짐

---

## draw.io XML (복사해서 붙여넣기)

```xml
<mxGraphModel dx="1422" dy="762" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="1169" pageHeight="827" math="0" shadow="0">
  <root>
    <mxCell id="0" />
    <mxCell id="1" parent="0" />

    <!-- ======================== users 테이블 ======================== -->
    <mxCell id="10" value="users" style="shape=table;startSize=30;container=1;collapsible=1;childLayout=tableLayout;fixedRows=1;rowLines=0;fontStyle=1;align=center;resizeLast=1;fontSize=14;" vertex="1" parent="1">
      <mxGeometry x="40" y="60" width="280" height="210" as="geometry" />
    </mxCell>
    <mxCell id="11" value="" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=12;top=0;left=0;right=0;bottom=1;" vertex="1" parent="10">
      <mxGeometry y="30" width="280" height="30" as="geometry" />
    </mxCell>
    <mxCell id="11a" value="PK" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;fontStyle=1;overflow=hidden;" vertex="1" parent="11"><mxGeometry width="40" height="30" as="geometry"><mxRectangle width="40" height="30" as="alternateBounds"/></mxGeometry></mxCell>
    <mxCell id="11b" value="id  BIGINT  NOT NULL AUTO_INCREMENT" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="11"><mxGeometry x="40" width="240" height="30" as="geometry"><mxRectangle width="240" height="30" as="alternateBounds"/></mxGeometry></mxCell>
    <mxCell id="12" value="" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=12;top=0;left=0;right=0;bottom=0;" vertex="1" parent="10">
      <mxGeometry y="60" width="280" height="30" as="geometry" />
    </mxCell>
    <mxCell id="12a" value="" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="12"><mxGeometry width="40" height="30" as="geometry"><mxRectangle width="40" height="30" as="alternateBounds"/></mxGeometry></mxCell>
    <mxCell id="12b" value="email  VARCHAR(255)  UNIQUE NOT NULL" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="12"><mxGeometry x="40" width="240" height="30" as="geometry"><mxRectangle width="240" height="30" as="alternateBounds"/></mxGeometry></mxCell>
    <mxCell id="13" value="" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=12;top=0;left=0;right=0;bottom=0;" vertex="1" parent="10">
      <mxGeometry y="90" width="280" height="30" as="geometry" />
    </mxCell>
    <mxCell id="13a" value="" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="13"><mxGeometry width="40" height="30" as="geometry"><mxRectangle width="40" height="30" as="alternateBounds"/></mxGeometry></mxCell>
    <mxCell id="13b" value="password  VARCHAR(255)  NOT NULL" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="13"><mxGeometry x="40" width="240" height="30" as="geometry"><mxRectangle width="240" height="30" as="alternateBounds"/></mxGeometry></mxCell>
    <mxCell id="14" value="" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=12;top=0;left=0;right=0;bottom=0;" vertex="1" parent="10">
      <mxGeometry y="120" width="280" height="30" as="geometry" />
    </mxCell>
    <mxCell id="14a" value="" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="14"><mxGeometry width="40" height="30" as="geometry"><mxRectangle width="40" height="30" as="alternateBounds"/></mxGeometry></mxCell>
    <mxCell id="14b" value="name  VARCHAR(100)  NOT NULL" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="14"><mxGeometry x="40" width="240" height="30" as="geometry"><mxRectangle width="240" height="30" as="alternateBounds"/></mxGeometry></mxCell>
    <mxCell id="15" value="" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=12;top=0;left=0;right=0;bottom=0;" vertex="1" parent="10">
      <mxGeometry y="150" width="280" height="30" as="geometry" />
    </mxCell>
    <mxCell id="15a" value="" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="15"><mxGeometry width="40" height="30" as="geometry"><mxRectangle width="40" height="30" as="alternateBounds"/></mxGeometry></mxCell>
    <mxCell id="15b" value="role  VARCHAR(20)  (STUDENT|INSTRUCTOR)" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="15"><mxGeometry x="40" width="240" height="30" as="geometry"><mxRectangle width="240" height="30" as="alternateBounds"/></mxGeometry></mxCell>
    <mxCell id="16" value="" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=12;top=0;left=0;right=0;bottom=0;" vertex="1" parent="10">
      <mxGeometry y="180" width="280" height="30" as="geometry" />
    </mxCell>
    <mxCell id="16a" value="" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="16"><mxGeometry width="40" height="30" as="geometry"><mxRectangle width="40" height="30" as="alternateBounds"/></mxGeometry></mxCell>
    <mxCell id="16b" value="created_at / updated_at  DATETIME" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="16"><mxGeometry x="40" width="240" height="30" as="geometry"><mxRectangle width="240" height="30" as="alternateBounds"/></mxGeometry></mxCell>

    <!-- ======================== courses 테이블 ======================== -->
    <mxCell id="20" value="courses" style="shape=table;startSize=30;container=1;collapsible=1;childLayout=tableLayout;fixedRows=1;rowLines=0;fontStyle=1;align=center;resizeLast=1;fontSize=14;" vertex="1" parent="1">
      <mxGeometry x="440" y="60" width="300" height="300" as="geometry" />
    </mxCell>
    <mxCell id="21" value="" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=12;top=0;left=0;right=0;bottom=1;" vertex="1" parent="20">
      <mxGeometry y="30" width="300" height="30" as="geometry" />
    </mxCell>
    <mxCell id="21a" value="PK" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;fontStyle=1;overflow=hidden;" vertex="1" parent="21"><mxGeometry width="40" height="30" as="geometry"><mxRectangle width="40" height="30" as="alternateBounds"/></mxGeometry></mxCell>
    <mxCell id="21b" value="id  BIGINT  NOT NULL AUTO_INCREMENT" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="21"><mxGeometry x="40" width="260" height="30" as="geometry"><mxRectangle width="260" height="30" as="alternateBounds"/></mxGeometry></mxCell>
    <mxCell id="22" value="" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=12;top=0;left=0;right=0;bottom=0;" vertex="1" parent="20">
      <mxGeometry y="60" width="300" height="30" as="geometry" />
    </mxCell>
    <mxCell id="22a" value="" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="22"><mxGeometry width="40" height="30" as="geometry"><mxRectangle width="40" height="30" as="alternateBounds"/></mxGeometry></mxCell>
    <mxCell id="22b" value="title  VARCHAR(255)  NOT NULL" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="22"><mxGeometry x="40" width="260" height="30" as="geometry"><mxRectangle width="260" height="30" as="alternateBounds"/></mxGeometry></mxCell>
    <mxCell id="23" value="" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=12;top=0;left=0;right=0;bottom=0;" vertex="1" parent="20">
      <mxGeometry y="90" width="300" height="30" as="geometry" />
    </mxCell>
    <mxCell id="23a" value="" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="23"><mxGeometry width="40" height="30" as="geometry"><mxRectangle width="40" height="30" as="alternateBounds"/></mxGeometry></mxCell>
    <mxCell id="23b" value="description  TEXT" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="23"><mxGeometry x="40" width="260" height="30" as="geometry"><mxRectangle width="260" height="30" as="alternateBounds"/></mxGeometry></mxCell>
    <mxCell id="24" value="" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=12;top=0;left=0;right=0;bottom=0;" vertex="1" parent="20">
      <mxGeometry y="120" width="300" height="30" as="geometry" />
    </mxCell>
    <mxCell id="24a" value="" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="24"><mxGeometry width="40" height="30" as="geometry"><mxRectangle width="40" height="30" as="alternateBounds"/></mxGeometry></mxCell>
    <mxCell id="24b" value="category  VARCHAR(50)  (SECURITY|MOBILE|DATABASE|OTHER)" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="24"><mxGeometry x="40" width="260" height="30" as="geometry"><mxRectangle width="260" height="30" as="alternateBounds"/></mxGeometry></mxCell>
    <mxCell id="25" value="" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=12;top=0;left=0;right=0;bottom=0;" vertex="1" parent="20">
      <mxGeometry y="150" width="300" height="30" as="geometry" />
    </mxCell>
    <mxCell id="25a" value="" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="25"><mxGeometry width="40" height="30" as="geometry"><mxRectangle width="40" height="30" as="alternateBounds"/></mxGeometry></mxCell>
    <mxCell id="25b" value="price  DECIMAL(10,2)  NOT NULL (만원단위)" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="25"><mxGeometry x="40" width="260" height="30" as="geometry"><mxRectangle width="260" height="30" as="alternateBounds"/></mxGeometry></mxCell>
    <mxCell id="26" value="" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=12;top=0;left=0;right=0;bottom=0;" vertex="1" parent="20">
      <mxGeometry y="180" width="300" height="30" as="geometry" />
    </mxCell>
    <mxCell id="26a" value="FK" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;fontStyle=2;overflow=hidden;" vertex="1" parent="26"><mxGeometry width="40" height="30" as="geometry"><mxRectangle width="40" height="30" as="alternateBounds"/></mxGeometry></mxCell>
    <mxCell id="26b" value="instructor_id  BIGINT  NOT NULL → users.id" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="26"><mxGeometry x="40" width="260" height="30" as="geometry"><mxRectangle width="260" height="30" as="alternateBounds"/></mxGeometry></mxCell>
    <mxCell id="27" value="" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=12;top=0;left=0;right=0;bottom=0;" vertex="1" parent="20">
      <mxGeometry y="210" width="300" height="30" as="geometry" />
    </mxCell>
    <mxCell id="27a" value="" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="27"><mxGeometry width="40" height="30" as="geometry"><mxRectangle width="40" height="30" as="alternateBounds"/></mxGeometry></mxCell>
    <mxCell id="27b" value="enrollment_count  INT  DEFAULT 0" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="27"><mxGeometry x="40" width="260" height="30" as="geometry"><mxRectangle width="260" height="30" as="alternateBounds"/></mxGeometry></mxCell>
    <mxCell id="28" value="" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=12;top=0;left=0;right=0;bottom=0;" vertex="1" parent="20">
      <mxGeometry y="240" width="300" height="30" as="geometry" />
    </mxCell>
    <mxCell id="28a" value="" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="28"><mxGeometry width="40" height="30" as="geometry"><mxRectangle width="40" height="30" as="alternateBounds"/></mxGeometry></mxCell>
    <mxCell id="28b" value="status  VARCHAR(20)  DEFAULT 'ACTIVE'" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="28"><mxGeometry x="40" width="260" height="30" as="geometry"><mxRectangle width="260" height="30" as="alternateBounds"/></mxGeometry></mxCell>
    <mxCell id="29" value="" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=12;top=0;left=0;right=0;bottom=0;" vertex="1" parent="20">
      <mxGeometry y="270" width="300" height="30" as="geometry" />
    </mxCell>
    <mxCell id="29a" value="" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="29"><mxGeometry width="40" height="30" as="geometry"><mxRectangle width="40" height="30" as="alternateBounds"/></mxGeometry></mxCell>
    <mxCell id="29b" value="created_at / updated_at  DATETIME" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="29"><mxGeometry x="40" width="260" height="30" as="geometry"><mxRectangle width="260" height="30" as="alternateBounds"/></mxGeometry></mxCell>

    <!-- ======================== enrollments 테이블 ======================== -->
    <mxCell id="30" value="enrollments" style="shape=table;startSize=30;container=1;collapsible=1;childLayout=tableLayout;fixedRows=1;rowLines=0;fontStyle=1;align=center;resizeLast=1;fontSize=14;" vertex="1" parent="1">
      <mxGeometry x="40" y="360" width="300" height="210" as="geometry" />
    </mxCell>
    <mxCell id="31" value="" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=12;top=0;left=0;right=0;bottom=1;" vertex="1" parent="30">
      <mxGeometry y="30" width="300" height="30" as="geometry" />
    </mxCell>
    <mxCell id="31a" value="PK" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;fontStyle=1;overflow=hidden;" vertex="1" parent="31"><mxGeometry width="40" height="30" as="geometry"><mxRectangle width="40" height="30" as="alternateBounds"/></mxGeometry></mxCell>
    <mxCell id="31b" value="id  BIGINT  NOT NULL AUTO_INCREMENT" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="31"><mxGeometry x="40" width="260" height="30" as="geometry"><mxRectangle width="260" height="30" as="alternateBounds"/></mxGeometry></mxCell>
    <mxCell id="32" value="" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=12;top=0;left=0;right=0;bottom=0;" vertex="1" parent="30">
      <mxGeometry y="60" width="300" height="30" as="geometry" />
    </mxCell>
    <mxCell id="32a" value="FK" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;fontStyle=2;overflow=hidden;" vertex="1" parent="32"><mxGeometry width="40" height="30" as="geometry"><mxRectangle width="40" height="30" as="alternateBounds"/></mxGeometry></mxCell>
    <mxCell id="32b" value="user_id  BIGINT  NOT NULL → users.id" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="32"><mxGeometry x="40" width="260" height="30" as="geometry"><mxRectangle width="260" height="30" as="alternateBounds"/></mxGeometry></mxCell>
    <mxCell id="33" value="" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=12;top=0;left=0;right=0;bottom=0;" vertex="1" parent="30">
      <mxGeometry y="90" width="300" height="30" as="geometry" />
    </mxCell>
    <mxCell id="33a" value="FK" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;fontStyle=2;overflow=hidden;" vertex="1" parent="33"><mxGeometry width="40" height="30" as="geometry"><mxRectangle width="40" height="30" as="alternateBounds"/></mxGeometry></mxCell>
    <mxCell id="33b" value="course_id  BIGINT  NOT NULL → courses.id" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="33"><mxGeometry x="40" width="260" height="30" as="geometry"><mxRectangle width="260" height="30" as="alternateBounds"/></mxGeometry></mxCell>
    <mxCell id="34" value="" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=12;top=0;left=0;right=0;bottom=0;" vertex="1" parent="30">
      <mxGeometry y="120" width="300" height="30" as="geometry" />
    </mxCell>
    <mxCell id="34a" value="" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="34"><mxGeometry width="40" height="30" as="geometry"><mxRectangle width="40" height="30" as="alternateBounds"/></mxGeometry></mxCell>
    <mxCell id="34b" value="status  VARCHAR(20)  DEFAULT 'PENDING'" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="34"><mxGeometry x="40" width="260" height="30" as="geometry"><mxRectangle width="260" height="30" as="alternateBounds"/></mxGeometry></mxCell>
    <mxCell id="34c" value="" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=12;top=0;left=0;right=0;bottom=0;" vertex="1" parent="30">
      <mxGeometry y="150" width="300" height="30" as="geometry" />
    </mxCell>
    <mxCell id="34d" value="UQ" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;fontStyle=2;overflow=hidden;" vertex="1" parent="34c"><mxGeometry width="40" height="30" as="geometry"><mxRectangle width="40" height="30" as="alternateBounds"/></mxGeometry></mxCell>
    <mxCell id="34e" value="UNIQUE (user_id, course_id)  중복신청 불가" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="34c"><mxGeometry x="40" width="260" height="30" as="geometry"><mxRectangle width="260" height="30" as="alternateBounds"/></mxGeometry></mxCell>
    <mxCell id="35" value="" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=12;top=0;left=0;right=0;bottom=0;" vertex="1" parent="30">
      <mxGeometry y="180" width="300" height="30" as="geometry" />
    </mxCell>
    <mxCell id="35a" value="" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="35"><mxGeometry width="40" height="30" as="geometry"><mxRectangle width="40" height="30" as="alternateBounds"/></mxGeometry></mxCell>
    <mxCell id="35b" value="created_at / updated_at  DATETIME" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="35"><mxGeometry x="40" width="260" height="30" as="geometry"><mxRectangle width="260" height="30" as="alternateBounds"/></mxGeometry></mxCell>

    <!-- ======================== payments 테이블 ======================== -->
    <mxCell id="40" value="payments" style="shape=table;startSize=30;container=1;collapsible=1;childLayout=tableLayout;fixedRows=1;rowLines=0;fontStyle=1;align=center;resizeLast=1;fontSize=14;" vertex="1" parent="1">
      <mxGeometry x="440" y="420" width="300" height="240" as="geometry" />
    </mxCell>
    <mxCell id="41" value="" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=12;top=0;left=0;right=0;bottom=1;" vertex="1" parent="40">
      <mxGeometry y="30" width="300" height="30" as="geometry" />
    </mxCell>
    <mxCell id="41a" value="PK" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;fontStyle=1;overflow=hidden;" vertex="1" parent="41"><mxGeometry width="40" height="30" as="geometry"><mxRectangle width="40" height="30" as="alternateBounds"/></mxGeometry></mxCell>
    <mxCell id="41b" value="id  BIGINT  NOT NULL AUTO_INCREMENT" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="41"><mxGeometry x="40" width="260" height="30" as="geometry"><mxRectangle width="260" height="30" as="alternateBounds"/></mxGeometry></mxCell>
    <mxCell id="42" value="" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=12;top=0;left=0;right=0;bottom=0;" vertex="1" parent="40">
      <mxGeometry y="60" width="300" height="30" as="geometry" />
    </mxCell>
    <mxCell id="42a" value="FK" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;fontStyle=2;overflow=hidden;" vertex="1" parent="42"><mxGeometry width="40" height="30" as="geometry"><mxRectangle width="40" height="30" as="alternateBounds"/></mxGeometry></mxCell>
    <mxCell id="42b" value="user_id  BIGINT  NOT NULL → users.id" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="42"><mxGeometry x="40" width="260" height="30" as="geometry"><mxRectangle width="260" height="30" as="alternateBounds"/></mxGeometry></mxCell>
    <mxCell id="43" value="" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=12;top=0;left=0;right=0;bottom=0;" vertex="1" parent="40">
      <mxGeometry y="90" width="300" height="30" as="geometry" />
    </mxCell>
    <mxCell id="43a" value="FK" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;fontStyle=2;overflow=hidden;" vertex="1" parent="43"><mxGeometry width="40" height="30" as="geometry"><mxRectangle width="40" height="30" as="alternateBounds"/></mxGeometry></mxCell>
    <mxCell id="43b" value="course_id  BIGINT  NOT NULL → courses.id" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="43"><mxGeometry x="40" width="260" height="30" as="geometry"><mxRectangle width="260" height="30" as="alternateBounds"/></mxGeometry></mxCell>
    <mxCell id="44" value="" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=12;top=0;left=0;right=0;bottom=0;" vertex="1" parent="40">
      <mxGeometry y="120" width="300" height="30" as="geometry" />
    </mxCell>
    <mxCell id="44a" value="" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="44"><mxGeometry width="40" height="30" as="geometry"><mxRectangle width="40" height="30" as="alternateBounds"/></mxGeometry></mxCell>
    <mxCell id="44b" value="amount  DECIMAL(10,2)  NOT NULL (만원단위)" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="44"><mxGeometry x="40" width="260" height="30" as="geometry"><mxRectangle width="260" height="30" as="alternateBounds"/></mxGeometry></mxCell>
    <mxCell id="45" value="" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=12;top=0;left=0;right=0;bottom=0;" vertex="1" parent="40">
      <mxGeometry y="150" width="300" height="30" as="geometry" />
    </mxCell>
    <mxCell id="45a" value="" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="45"><mxGeometry width="40" height="30" as="geometry"><mxRectangle width="40" height="30" as="alternateBounds"/></mxGeometry></mxCell>
    <mxCell id="45b" value="status  VARCHAR(20)  DEFAULT 'PENDING'" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="45"><mxGeometry x="40" width="260" height="30" as="geometry"><mxRectangle width="260" height="30" as="alternateBounds"/></mxGeometry></mxCell>
    <mxCell id="46" value="" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=12;top=0;left=0;right=0;bottom=0;" vertex="1" parent="40">
      <mxGeometry y="180" width="300" height="30" as="geometry" />
    </mxCell>
    <mxCell id="46a" value="UQ" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;fontStyle=2;overflow=hidden;" vertex="1" parent="46"><mxGeometry width="40" height="30" as="geometry"><mxRectangle width="40" height="30" as="alternateBounds"/></mxGeometry></mxCell>
    <mxCell id="46b" value="transaction_id  VARCHAR(255)  UNIQUE" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="46"><mxGeometry x="40" width="260" height="30" as="geometry"><mxRectangle width="260" height="30" as="alternateBounds"/></mxGeometry></mxCell>
    <mxCell id="47" value="" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=12;top=0;left=0;right=0;bottom=0;" vertex="1" parent="40">
      <mxGeometry y="210" width="300" height="30" as="geometry" />
    </mxCell>
    <mxCell id="47a" value="" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="47"><mxGeometry width="40" height="30" as="geometry"><mxRectangle width="40" height="30" as="alternateBounds"/></mxGeometry></mxCell>
    <mxCell id="47b" value="created_at / updated_at  DATETIME" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="47"><mxGeometry x="40" width="260" height="30" as="geometry"><mxRectangle width="260" height="30" as="alternateBounds"/></mxGeometry></mxCell>

    <!-- ======================== 관계선 (FK 연결) ======================== -->
    <!-- users → courses (instructor_id) -->
    <mxCell id="50" value="공급사가 공고 등록&#xa;1 : N" style="edgeStyle=entityRelationEdgeStyle;endArrow=ERzeroToMany;startArrow=ERmandOne;exitX=1;exitY=0.5;entryX=0;entryY=0.5;" edge="1" source="15" target="26" parent="1">
      <mxGeometry relative="1" as="geometry" />
    </mxCell>
    <!-- users → enrollments (user_id) -->
    <mxCell id="51" value="청약자가 신청&#xa;1 : N" style="edgeStyle=entityRelationEdgeStyle;endArrow=ERzeroToMany;startArrow=ERmandOne;exitX=0;exitY=0.5;entryX=0;entryY=0.5;" edge="1" source="15" target="32" parent="1">
      <mxGeometry relative="1" as="geometry" />
    </mxCell>
    <!-- courses → enrollments (course_id) -->
    <mxCell id="52" value="공고에 청약 신청&#xa;1 : N" style="edgeStyle=entityRelationEdgeStyle;endArrow=ERzeroToMany;startArrow=ERmandOne;exitX=0;exitY=0.5;entryX=1;entryY=0.5;" edge="1" source="26" target="33" parent="1">
      <mxGeometry relative="1" as="geometry" />
    </mxCell>
    <!-- users → payments (user_id) -->
    <mxCell id="53" value="청약자가 결제&#xa;1 : N" style="edgeStyle=entityRelationEdgeStyle;endArrow=ERzeroToMany;startArrow=ERmandOne;exitX=1;exitY=0.5;entryX=0;entryY=0.5;" edge="1" source="15" target="42" parent="1">
      <mxGeometry relative="1" as="geometry" />
    </mxCell>
    <!-- courses → payments (course_id) -->
    <mxCell id="54" value="공고별 결제&#xa;1 : N" style="edgeStyle=entityRelationEdgeStyle;endArrow=ERzeroToMany;startArrow=ERmandOne;exitX=1;exitY=0.5;entryX=1;entryY=0.5;" edge="1" source="26" target="43" parent="1">
      <mxGeometry relative="1" as="geometry" />
    </mxCell>

  </root>
</mxGraphModel>
```

---

## 테이블 관계 요약

| 관계 | 설명 | 카디널리티 |
|------|------|---------|
| users → courses | 공급사 1명이 여러 공고 등록 (`instructor_id`) | 1 : N |
| users → enrollments | 청약자 1명이 여러 공고에 신청 (`user_id`) | 1 : N |
| courses → enrollments | 공고 1개에 여러 청약자 신청 (`course_id`) | 1 : N |
| users → payments | 청약자 1명이 여러 결제 내역 보유 (`user_id`) | 1 : N |
| courses → payments | 공고 1개에 여러 결제 내역 (`course_id`) | 1 : N |

> ℹ️ `payments`와 `enrollments` 사이에 직접 FK 없음. `(user_id + course_id)` 조합으로 논리적으로 연결됨.
