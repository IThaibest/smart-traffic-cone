// Optional local map config. Copy config.example.js to config.local.js and
// set window.DISPATCH_WEB_CONFIG when a real AMap layer is needed.
const MAP_CONFIG = window.DISPATCH_WEB_CONFIG || {};
const AMAP_KEY = MAP_CONFIG.amapKey || "";
const AMAP_SECURITY_CODE = MAP_CONFIG.amapSecurityCode || "";

const scenarioCenters = {
  construction: [116.397428, 39.90923],
  accident: [116.481488, 39.98965],
  closure: [116.34208, 39.93644],
  weather: [116.30221, 39.88491]
};

const realMapState = {
  ready: false,
  attempted: false,
  maps: {},
  layers: {},
  userMarker: null,
  locating: false,
  hasUserLocation: false,
  suppressFit: false
};

const scenarios = [
  {
    id: "construction",
    title: "城市道路施工占道",
    short: "施工布设",
    desc: "8 个智能路锥形成右侧施工边界，雷达检测后方车辆逐渐接近，平台生成中风险告警并推送减速预警。",
    road: "人民路北向主路",
    type: "道路施工",
    level: "中",
    levelKey: "mid",
    sync: "未同步",
    cones: [
      { id: "C-101", x: 24, y: 56, status: "ok", gps: "2.1m", radar: 44, vision: "车辆 1 / 置信度 0.91" },
      { id: "C-102", x: 31, y: 54, status: "ok", gps: "2.4m", radar: 39, vision: "车辆 1 / 置信度 0.89" },
      { id: "C-103", x: 38, y: 52, status: "mid", gps: "3.1m", radar: 31, vision: "路障 2 / 置信度 0.86" },
      { id: "C-104", x: 45, y: 50, status: "ok", gps: "2.2m", radar: 26, vision: "车辆 1 / 置信度 0.88" },
      { id: "C-105", x: 52, y: 48, status: "high", gps: "2.0m", radar: 18, vision: "车辆接近 / 置信度 0.93" },
      { id: "C-106", x: 59, y: 46, status: "ok", gps: "2.6m", radar: 22, vision: "施工区 / 置信度 0.90" },
      { id: "C-107", x: 66, y: 44, status: "ok", gps: "2.7m", radar: 28, vision: "路障 1 / 置信度 0.84" },
      { id: "C-108", x: 73, y: 42, status: "off", gps: "--", radar: 0, vision: "离线" }
    ],
    zone: { x: 20, y: 38, w: 60, h: 25 },
    warning: { x: 43, y: 28, w: 34, h: 43 },
    objects: [
      { type: "vehicle", x: 50, y: 42 },
      { type: "person", x: 58, y: 58 }
    ],
    alerts: [
      { id: "A-2301", level: "中", levelKey: "mid", type: "车辆接近", text: "C-105 雷达最近距离 18m，距离持续缩短", status: "待确认" },
      { id: "A-2302", level: "低", levelKey: "low", type: "设备离线", text: "C-108 90 秒未上报，需现场复核", status: "待处理" }
    ],
    timeline: [
      ["09:12:04", "路锥完成部署，系统自动生成施工边界"],
      ["09:12:18", "GPS 校验通过，布设完整度 88%"],
      ["09:13:01", "雷达检测车辆接近，触发中风险告警"]
    ],
    recommendations: ["确认 C-105 车辆接近告警", "向后方车辆推送减速预警", "通知现场复核 C-108 离线状态"]
  },
  {
    id: "accident",
    title: "高速事故隔离区",
    short: "事故隔离",
    desc: "事故发生后快速放置 6 个智能路锥，平台自动生成事故隔离区，后方来车快速接近并触发紧急风险。",
    road: "G42 高速东向 31K+200",
    type: "交通事故",
    level: "紧急",
    levelKey: "critical",
    sync: "已同步",
    cones: [
      { id: "C-201", x: 28, y: 62, status: "high", gps: "1.9m", radar: 14, vision: "事故车 / 置信度 0.94" },
      { id: "C-202", x: 36, y: 59, status: "high", gps: "2.1m", radar: 11, vision: "车辆 2 / 置信度 0.92" },
      { id: "C-203", x: 44, y: 56, status: "high", gps: "2.2m", radar: 9, vision: "车辆接近 / 置信度 0.95" },
      { id: "C-204", x: 52, y: 53, status: "mid", gps: "2.5m", radar: 17, vision: "行人 1 / 置信度 0.82" },
      { id: "C-205", x: 60, y: 50, status: "ok", gps: "2.0m", radar: 24, vision: "路障 2 / 置信度 0.87" },
      { id: "C-206", x: 68, y: 47, status: "ok", gps: "2.3m", radar: 29, vision: "事故区 / 置信度 0.89" }
    ],
    zone: { x: 24, y: 42, w: 50, h: 27 },
    warning: { x: 25, y: 31, w: 48, h: 44 },
    objects: [
      { type: "vehicle", x: 39, y: 48 },
      { type: "vehicle", x: 31, y: 51 },
      { type: "person", x: 54, y: 48 }
    ],
    alerts: [
      { id: "A-2401", level: "紧急", levelKey: "critical", type: "快速接近", text: "C-203 最近距离 9m，预计 4 秒进入危险区", status: "待处置" },
      { id: "A-2402", level: "高", levelKey: "high", type: "人员风险", text: "C-204 识别到行人处于事故隔离边界", status: "待确认" }
    ],
    timeline: [
      ["14:27:10", "事故路锥快速布设，平台生成待确认事件"],
      ["14:27:18", "事故隔离区同步至车辆预警接口"],
      ["14:27:36", "后方来车快速接近，风险升为紧急"]
    ],
    recommendations: ["立即推送后方来车强提醒", "派发应急人员扩大缓冲区", "保留现场截图进入复盘报告"]
  },
  {
    id: "closure",
    title: "大型活动临时封路",
    short: "临时封路",
    desc: "多个路锥形成封控边界，车辆误入封控区，调度中心派发现场拦截任务并撤销过期道路通行信息。",
    road: "滨河大道西向辅路",
    type: "临时封路",
    level: "高",
    levelKey: "high",
    sync: "已同步",
    cones: [
      { id: "C-301", x: 22, y: 50, status: "ok", gps: "2.2m", radar: 35, vision: "封路牌 / 置信度 0.88" },
      { id: "C-302", x: 30, y: 49, status: "ok", gps: "2.0m", radar: 32, vision: "路障 1 / 置信度 0.84" },
      { id: "C-303", x: 38, y: 48, status: "ok", gps: "2.4m", radar: 30, vision: "路障 1 / 置信度 0.85" },
      { id: "C-304", x: 46, y: 47, status: "mid", gps: "3.2m", radar: 21, vision: "车辆误入 / 置信度 0.91" },
      { id: "C-305", x: 54, y: 46, status: "high", gps: "2.7m", radar: 13, vision: "车辆误入 / 置信度 0.93" },
      { id: "C-306", x: 62, y: 45, status: "ok", gps: "2.3m", radar: 27, vision: "封控区 / 置信度 0.90" },
      { id: "C-307", x: 70, y: 44, status: "ok", gps: "2.4m", radar: 33, vision: "路障 2 / 置信度 0.86" }
    ],
    zone: { x: 18, y: 39, w: 58, h: 18 },
    warning: { x: 38, y: 34, w: 34, h: 34 },
    objects: [
      { type: "vehicle", x: 49, y: 43 }
    ],
    alerts: [
      { id: "A-2501", level: "高", levelKey: "high", type: "车辆误入", text: "C-305 识别到车辆进入封控边界", status: "待处置" },
      { id: "A-2502", level: "中", levelKey: "mid", type: "定位漂移", text: "C-304 GPS 精度下降至 3.2m", status: "待确认" }
    ],
    timeline: [
      ["18:00:00", "封路事件按计划生效"],
      ["18:01:22", "封路范围已同步地图平台"],
      ["18:02:09", "车辆误入封控区，触发高风险告警"]
    ],
    recommendations: ["派发现场拦截任务", "保持封路预警同步", "复核 C-304 定位漂移"]
  },
  {
    id: "weather",
    title: "夜间低能见度施工",
    short: "低能见度",
    desc: "夜间雨雾导致视觉置信度下降，系统提高风险权重，并提示雷达结果优先参考，扩大车辆预警半径。",
    road: "环城快速路南向",
    type: "恶劣天气",
    level: "高",
    levelKey: "high",
    sync: "未同步",
    cones: [
      { id: "C-401", x: 25, y: 58, status: "mid", gps: "2.9m", radar: 28, vision: "画面质量低 / 置信度 0.55" },
      { id: "C-402", x: 34, y: 55, status: "mid", gps: "2.7m", radar: 24, vision: "车辆疑似 / 置信度 0.58" },
      { id: "C-403", x: 43, y: 52, status: "high", gps: "2.5m", radar: 16, vision: "低能见度 / 置信度 0.51" },
      { id: "C-404", x: 52, y: 49, status: "high", gps: "2.8m", radar: 14, vision: "车辆疑似 / 置信度 0.57" },
      { id: "C-405", x: 61, y: 46, status: "ok", gps: "2.6m", radar: 23, vision: "施工区 / 置信度 0.62" },
      { id: "C-406", x: 70, y: 43, status: "ok", gps: "2.4m", radar: 31, vision: "路障 / 置信度 0.64" }
    ],
    zone: { x: 22, y: 39, w: 54, h: 25 },
    warning: { x: 24, y: 28, w: 55, h: 47 },
    objects: [
      { type: "vehicle", x: 46, y: 44 },
      { type: "person", x: 60, y: 56 }
    ],
    alerts: [
      { id: "A-2601", level: "高", levelKey: "high", type: "低能见度", text: "视觉置信度低于 0.6，雷达检测距离 14m", status: "待确认" },
      { id: "A-2602", level: "中", levelKey: "mid", type: "预警半径调整", text: "恶劣天气场景下建议扩大预警半径", status: "待处理" }
    ],
    timeline: [
      ["22:41:05", "天气标记为夜间雨雾"],
      ["22:41:15", "摄像头置信度下降，设备可信度降为中"],
      ["22:41:44", "雷达稳定检测接近目标，风险升为高"]
    ],
    recommendations: ["扩大车辆预警半径", "提示现场人员加强照明", "将雷达距离作为主要判断依据"]
  }
];

const state = {
  activeScenario: "construction",
  selectedConeId: "C-105",
  selectedView: "overview",
  demoStep: 0,
  dispatched: false,
  synced: false,
  closed: false
};

const levelText = {
  low: "低",
  mid: "中",
  high: "高",
  critical: "紧急"
};

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

function getScenario() {
  return scenarios.find((item) => item.id === state.activeScenario);
}

function init() {
  renderScenarioButtons();
  bindEvents();
  initAmap();
  renderAll();
  setInterval(updateClock, 1000);
  updateClock();
}

function bindEvents() {
  $$(".nav-item").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedView = button.dataset.view;
      renderView();
    });
  });

  $("#dispatchBtn").addEventListener("click", () => {
    state.dispatched = true;
    addTimeline("调度中心已派发现场处置任务");
    showToast("已派发处置任务：现场人员收到路锥复核与风险隔离指令。");
    renderAll();
  });

  $("#syncBtn").addEventListener("click", () => {
    state.synced = true;
    addTimeline("道路事件已同步至地图平台与车辆预警接口");
    showToast("已同步预警：车辆端将收到前方风险、建议减速和影响范围。");
    renderAll();
  });

  $("#closeBtn").addEventListener("click", () => {
    state.closed = true;
    addTimeline("现场确认风险解除，事件进入待复盘状态");
    showToast("事件已关闭：系统保留告警、截图和雷达曲线用于复盘。");
    renderAll();
  });

  $("#nextStepBtn").addEventListener("click", nextDemoStep);
  $("#playDemoBtn").addEventListener("click", playDemo);
  $("#locateBtn").addEventListener("click", requestUserLocation);
  $("#selectAllConesBtn").addEventListener("click", () => showToast("已框选当前事件关联路锥，系统将校验边界连续性。"));
  $("#generateEventBtn").addEventListener("click", () => showToast("已根据路锥阵列生成道路临时事件，并计算影响范围。"));
  $("#replayBtn").addEventListener("click", () => showToast("正在回放：路锥布设、车辆接近、告警升级、任务派发。"));
  $("#newEventBtn").addEventListener("click", () => showToast("演示中可通过地图框选路锥快速生成事件。"));
  $("#handleAllBtn").addEventListener("click", () => showToast("已批量确认告警，真实风险进入事件中心，误报进入复盘样本。"));
}

function renderScenarioButtons() {
  $("#scenarioList").innerHTML = scenarios.map((scenario) => `
    <button class="scenario-button ${scenario.id === state.activeScenario ? "is-active" : ""}" data-scenario="${scenario.id}">
      <strong>${scenario.short}</strong>
      <span>${scenario.type} / ${scenario.level}风险</span>
    </button>
  `).join("");

  $$(".scenario-button").forEach((button) => {
    button.addEventListener("click", () => {
      state.activeScenario = button.dataset.scenario;
      state.selectedConeId = getScenario().cones.find((cone) => cone.status === "high")?.id || getScenario().cones[0].id;
      state.demoStep = 0;
      state.dispatched = false;
      state.synced = false;
      state.closed = false;
      renderScenarioButtons();
      renderAll();
      showToast(`已切换场景：${getScenario().title}`);
    });
  });
}

function renderAll() {
  renderHero();
  renderMap("smartMap");
  renderMap("largeMap");
  renderRealMaps();
  renderDetails();
  renderAlerts();
  renderTimeline();
  renderFusion();
  renderEvents();
  renderDevices();
  renderAnalysis();
  renderView();
}

function renderView() {
  $$(".nav-item").forEach((item) => item.classList.toggle("is-active", item.dataset.view === state.selectedView));
  $$("[data-view-panel]").forEach((panel) => panel.classList.toggle("is-visible", panel.dataset.viewPanel === state.selectedView));
}

function renderHero() {
  const scenario = getScenario();
  const online = scenario.cones.filter((cone) => cone.status !== "off").length;
  const high = scenario.cones.filter((cone) => cone.status === "high").length;
  const minDistance = Math.min(...scenario.cones.filter((cone) => cone.radar > 0).map((cone) => cone.radar));
  $("#scenarioTitle").textContent = scenario.title;
  $("#scenarioDesc").textContent = scenario.desc;
  $("#heroMetrics").innerHTML = [
    ["事件等级", scenario.level],
    ["在线路锥", `${online}/${scenario.cones.length}`],
    ["最近距离", `${minDistance}m`],
    ["高风险点", high]
  ].map(([label, value]) => `<div class="metric"><strong>${value}</strong><span>${label}</span></div>`).join("");
}

function renderMap(mapId) {
  const scenario = getScenario();
  const map = $(`#${mapId}`);
  if (!map) return;

  $$(".cone, .vehicle, .person", map).forEach((node) => node.remove());
  const zone = mapId === "largeMap" ? $("#largeEventZone") : $("#eventZone");
  const warning = mapId === "largeMap" ? $("#largeWarningRadius") : $("#warningRadius");
  placeBox(zone, scenario.zone);
  placeBox(warning, scenario.warning);

  scenario.cones.forEach((cone) => {
    const button = document.createElement("button");
    button.className = `cone ${cone.status} ${cone.id === state.selectedConeId ? "is-selected" : ""}`;
    button.style.left = `${cone.x}%`;
    button.style.top = `${cone.y}%`;
    button.title = `${cone.id} ${cone.status}`;
    button.setAttribute("aria-label", `${cone.id} 路锥`);
    button.addEventListener("click", () => {
      state.selectedConeId = cone.id;
      renderAll();
    });
    map.appendChild(button);
  });

  scenario.objects.forEach((object) => {
    const item = document.createElement("div");
    item.className = object.type;
    item.style.left = `${object.x}%`;
    item.style.top = `${object.y}%`;
    map.appendChild(item);
  });
}

function initAmap() {
  if (!AMAP_KEY || AMAP_KEY === "YOUR_AMAP_WEB_KEY") {
    showToast("未配置高德 Key，当前使用示意地图。将 script.js 顶部 AMAP_KEY 替换后即可显示真实地图。");
    return;
  }

  if (AMAP_SECURITY_CODE) {
    window._AMapSecurityConfig = { securityJsCode: AMAP_SECURITY_CODE };
  }

  realMapState.attempted = true;
  const script = document.createElement("script");
  script.src = `https://webapi.amap.com/maps?v=2.0&key=${encodeURIComponent(AMAP_KEY)}&plugin=AMap.Scale,AMap.ToolBar`;
  script.async = true;
  script.onload = () => {
    realMapState.ready = true;
    createRealMap("smartMap");
    createRealMap("largeMap");
    renderRealMaps();
    requestUserLocation();
    showToast("高德地图加载成功，已切换为真实地图调度视图。");
  };
  script.onerror = () => {
    showToast("高德地图加载失败，已保留示意地图用于汇报兜底。");
  };
  document.head.appendChild(script);
}

function createRealMap(hostId) {
  const host = $(`#${hostId}`);
  if (!host || realMapState.maps[hostId] || !window.AMap) return;

  host.classList.add("using-real-map");
  const canvas = document.createElement("div");
  canvas.className = "real-map-canvas";
  host.prepend(canvas);

  const map = new AMap.Map(canvas, {
    zoom: hostId === "largeMap" ? 16 : 15,
    center: getScenarioCenter(),
    viewMode: "2D",
    resizeEnable: true,
    mapStyle: "amap://styles/darkblue"
  });

  map.addControl(new AMap.Scale());
  map.addControl(new AMap.ToolBar({ position: { right: "12px", top: "12px" } }));
  map.on("zoomend", () => {
    realMapState.suppressFit = true;
    renderRealMap(hostId, { keepViewport: true });
    realMapState.suppressFit = false;
  });
  realMapState.maps[hostId] = map;
  realMapState.layers[hostId] = [];
}

function renderRealMaps() {
  if (!realMapState.ready || !window.AMap) return;
  Object.keys(realMapState.maps).forEach(renderRealMap);
}

function renderRealMap(hostId, options = {}) {
  const scenario = getScenario();
  const map = realMapState.maps[hostId];
  if (!map) return;

  const oldLayers = realMapState.layers[hostId] || [];
  if (oldLayers.length) {
    map.remove(oldLayers);
  }

  const layers = [];
  const center = getScenarioCenter();
  const markerScale = getMarkerScale(map.getZoom());
  if (!options.keepViewport) {
    map.setCenter(center);
  }

  const zoneBounds = percentBoxToLngLat(scenario.zone);
  const zone = new AMap.Polygon({
    path: zoneBounds,
    strokeColor: "#ff7d4d",
    strokeWeight: 2,
    fillColor: "#ff7d4d",
    fillOpacity: 0.18,
    zIndex: 12
  });
  layers.push(zone);

  const warningCenter = percentToLngLat(
    scenario.warning.x + scenario.warning.w / 2,
    scenario.warning.y + scenario.warning.h / 2
  );
  const warningRadius = Math.max(scenario.warning.w, scenario.warning.h) * 15;
  const warning = new AMap.Circle({
    center: warningCenter,
    radius: warningRadius,
    strokeColor: "#ff4f5e",
    strokeOpacity: 0.95,
    strokeWeight: 2,
    strokeStyle: "dashed",
    fillColor: "#ff4f5e",
    fillOpacity: 0.12,
    zIndex: 11
  });
  layers.push(warning);

  scenario.cones.forEach((cone) => {
    const size = getConeSize(markerScale);
    const marker = new AMap.Marker({
      position: percentToLngLat(cone.x, cone.y),
      offset: new AMap.Pixel(-size.width / 2, -size.height),
      content: `<div class="amap-cone ${cone.status} ${cone.id === state.selectedConeId ? "is-selected" : ""}" style="--marker-size:${markerScale}" title="${cone.id}"></div>`,
      zIndex: 30
    });
    marker.on("click", () => {
      state.selectedConeId = cone.id;
      renderAll();
    });
    layers.push(marker);
  });

  scenario.objects.forEach((object) => {
    const offset = object.type === "vehicle"
      ? new AMap.Pixel(-21 * markerScale, -11 * markerScale)
      : new AMap.Pixel(-8 * markerScale, -12 * markerScale);
    const marker = new AMap.Marker({
      position: percentToLngLat(object.x, object.y),
      offset,
      content: `<div class="amap-${object.type}" style="--marker-size:${markerScale}"></div>`,
      zIndex: 25
    });
    layers.push(marker);
  });

  const roadblock = new AMap.Marker({
    position: percentToLngLat(scenario.zone.x + scenario.zone.w / 2, scenario.zone.y + scenario.zone.h / 2),
    offset: new AMap.Pixel(-42 * markerScale, -16 * markerScale),
    content: `<div class="amap-roadblock-label" style="--marker-size:${markerScale}">临时路障区</div>`,
    zIndex: 36
  });
  layers.push(roadblock);

  const label = new AMap.Text({
    text: `${scenario.type} / ${scenario.level}风险`,
    position: percentToLngLat(scenario.zone.x + 2, scenario.zone.y - 3),
    style: {
      "background-color": "rgba(15, 22, 32, 0.9)",
      "border": "1px solid #4aa8ff",
      "color": "#eef3f8",
      "padding": "5px 8px",
      "font-size": "12px"
    },
    zIndex: 35
  });
  layers.push(label);

  map.add(layers);
  realMapState.layers[hostId] = layers;
  renderUserMarker(hostId);
  if (!options.keepViewport && !realMapState.suppressFit) {
    map.setFitView(layers.filter((layer) => layer.CLASS_NAME !== "AMap.Text"), false, [48, 48, 48, 48], hostId === "largeMap" ? 16 : 15);
  }
}

function requestUserLocation() {
  if (!realMapState.ready || !window.AMap) {
    showToast("真实地图尚未加载完成，定位会在高德地图加载后自动请求。");
    return;
  }

  if (realMapState.locating) return;
  realMapState.locating = true;
  showToast("正在请求浏览器当前位置，用于把演示路障布设到你所在区域附近。");

  AMap.plugin("AMap.Geolocation", () => {
    const geolocation = new AMap.Geolocation({
      enableHighAccuracy: true,
      timeout: 10000,
      zoomToAccuracy: false,
      showMarker: false,
      showCircle: false
    });

    geolocation.getCurrentPosition((status, result) => {
      realMapState.locating = false;
      if (status === "complete" && result.position) {
        const lng = result.position.lng;
        const lat = result.position.lat;
        applyUserLocation([lng, lat]);
        showToast("定位成功：演示场景已移动到当前位置附近。");
        renderAll();
        return;
      }

      showToast("定位未完成：浏览器可能拒绝权限或当前环境不支持，已继续使用默认演示点位。");
    });
  });
}

function applyUserLocation(position) {
  realMapState.hasUserLocation = true;
  const offsets = {
    construction: [0.0000, 0.0000],
    accident: [0.0060, 0.0035],
    closure: [-0.0055, 0.0028],
    weather: [0.0035, -0.0045]
  };

  Object.keys(scenarioCenters).forEach((key) => {
    scenarioCenters[key] = [
      position[0] + offsets[key][0],
      position[1] + offsets[key][1]
    ];
  });

  Object.values(realMapState.maps).forEach((map) => map.setCenter(getScenarioCenter()));
}

function renderUserMarker(hostId) {
  if (!realMapState.hasUserLocation || !window.AMap) return;
  const map = realMapState.maps[hostId];
  if (!map) return;
  const base = scenarioCenters.construction;
  const marker = new AMap.Marker({
    position: base,
    offset: new AMap.Pixel(-9, -9),
    content: `<div class="amap-user-location" title="当前位置"></div>`,
    zIndex: 45
  });
  map.add(marker);
  realMapState.layers[hostId].push(marker);
}

function getMarkerScale(zoom) {
  const scale = 0.55 + (zoom - 12) * 0.12;
  return Math.max(0.65, Math.min(1.55, Number(scale.toFixed(2))));
}

function getConeSize(scale) {
  return {
    width: 20 * scale,
    height: 24 * scale
  };
}

function getScenarioCenter() {
  return scenarioCenters[state.activeScenario] || scenarioCenters.construction;
}

function percentToLngLat(x, y) {
  const [lng, lat] = getScenarioCenter();
  const lngScale = 0.00022;
  const latScale = 0.00016;
  return [lng + (x - 50) * lngScale, lat - (y - 50) * latScale];
}

function percentBoxToLngLat(box) {
  return [
    percentToLngLat(box.x, box.y),
    percentToLngLat(box.x + box.w, box.y),
    percentToLngLat(box.x + box.w, box.y + box.h),
    percentToLngLat(box.x, box.y + box.h)
  ];
}

function placeBox(el, box) {
  el.style.left = `${box.x}%`;
  el.style.top = `${box.y}%`;
  el.style.width = `${box.w}%`;
  el.style.height = `${box.h}%`;
}

function renderDetails() {
  const scenario = getScenario();
  const cone = scenario.cones.find((item) => item.id === state.selectedConeId) || scenario.cones[0];
  $("#selectedTitle").textContent = `${cone.id} 路锥`;
  $("#selectedLevel").textContent = cone.status === "high" ? "高风险" : cone.status === "mid" ? "关注" : cone.status === "off" ? "离线" : "正常";
  $("#selectedLevel").className = `level-badge ${cone.status === "high" ? "level-high" : cone.status === "mid" ? "level-mid" : cone.status === "off" ? "" : "level-low"}`;
  $("#detailBody").innerHTML = [
    ["所属事件", `${scenario.type} / ${scenario.road}`],
    ["GPS 精度", cone.gps],
    ["雷达距离", cone.radar ? `${cone.radar}m` : "无数据"],
    ["视觉识别", cone.vision],
    ["边界判断", cone.status === "off" ? "边界存在不确定点" : "已纳入事件边界"],
    ["同步状态", state.synced ? "已同步车辆端与地图平台" : scenario.sync],
    ["处置状态", state.closed ? "已关闭，待复盘" : state.dispatched ? "处置中" : "待调度确认"]
  ].map(([key, value]) => `<div class="kv"><span>${key}</span><strong>${value}</strong></div>`).join("");
}

function renderAlerts() {
  const scenario = getScenario();
  const alerts = state.closed ? scenario.alerts.map((item) => ({ ...item, status: "已关闭" })) : scenario.alerts;
  $("#alertCount").textContent = alerts.length;
  $("#alertList").innerHTML = alerts.map(renderAlertItem).join("");
  $("#alertTable").innerHTML = alerts.map((alert) => `
    <div class="alert-row">
      <strong>${alert.id}</strong>
      <div><strong>${alert.type}</strong><span>${alert.text}</span></div>
      <span class="level-badge level-${alert.levelKey}">${alert.level}风险</span>
      <span>${alert.status}</span>
    </div>
  `).join("");
}

function renderAlertItem(alert) {
  return `
    <div class="alert-item">
      <span class="level-badge level-${alert.levelKey}">${alert.level}</span>
      <div><strong>${alert.type}</strong><span>${alert.text}</span></div>
      <span>${alert.status}</span>
    </div>
  `;
}

function renderTimeline() {
  const scenario = getScenario();
  const extra = [];
  if (state.dispatched) extra.push(["现在", "调度任务已派发，现场人员开始复核"]);
  if (state.synced) extra.push(["现在", "车辆端和地图平台收到道路风险信息"]);
  if (state.closed) extra.push(["现在", "事件关闭，复盘报告自动生成"]);
  const items = [...scenario.timeline, ...extra];
  $("#timeline").innerHTML = items.map(([time, text]) => `
    <div class="timeline-item"><time>${time}</time><strong>${text}</strong></div>
  `).join("");
}

function renderFusion() {
  const scenario = getScenario();
  const highCones = scenario.cones.filter((cone) => cone.status === "high").length;
  const offline = scenario.cones.filter((cone) => cone.status === "off").length;
  const minDistance = Math.min(...scenario.cones.filter((cone) => cone.radar > 0).map((cone) => cone.radar));
  $("#fusionList").innerHTML = [
    ["GPS 成区", `${scenario.cones.length} 个点位形成事件边界，影响道路：${scenario.road}`],
    ["视觉识别", scenario.objects.some((item) => item.type === "person") ? "识别到车辆与人员目标，进入复核队列" : "识别到车辆目标，支持风险确认"],
    ["雷达测距", `最近目标距离 ${minDistance}m，${minDistance < 15 ? "已进入高风险阈值" : "处于持续关注范围"}`],
    ["设备可信度", offline > 0 ? `${offline} 个路锥离线，可信度降为中` : "多传感器上报正常，可信度高"],
    ["风险汇总", `${highCones} 个高风险点，事件等级：${scenario.level}`]
  ].map(([title, text]) => `<div class="fusion-item"><strong>${title}</strong><span>${text}</span></div>`).join("");

  $("#recommendations").innerHTML = scenario.recommendations.map((item) => `
    <div class="recommend-item"><strong>${item}</strong><span>点击“下一步演示”可模拟该动作进入时间线</span></div>
  `).join("");
}

function renderEvents() {
  const scenario = getScenario();
  const rows = [
    [scenario.type, scenario.road, scenario.level, state.closed ? "已关闭" : state.dispatched ? "处置中" : "待确认"],
    ["路锥阵列异常", "当前事件边界", scenario.cones.some((cone) => cone.status === "off") ? "中" : "低", "监控中"],
    ["车辆预警", "事件上游 300m", scenario.level, state.synced ? "已同步" : "待同步"]
  ];
  $("#eventList").innerHTML = rows.map(([type, road, level, status], index) => `
    <div class="event-row">
      <strong>EV-${String(index + 1).padStart(4, "0")}</strong>
      <div><strong>${type}</strong><span>${road}</span></div>
      <span class="level-badge level-${levelToKey(level)}">${level}风险</span>
      <span>${status}</span>
    </div>
  `).join("");
}

function renderDevices() {
  const scenario = getScenario();
  $("#deviceGrid").innerHTML = scenario.cones.map((cone) => `
    <article class="device-card">
      <strong>${cone.id}</strong>
      <span>${statusLabel(cone.status)} / ${scenario.type}</span>
      <div class="device-meta">
        <span>GPS ${cone.gps}</span>
        <span>雷达 ${cone.radar || "--"}m</span>
        <span>状态 ${statusLabel(cone.status)}</span>
        <span>上报 ${cone.status === "off" ? "超时" : "正常"}</span>
      </div>
    </article>
  `).join("");
}

function renderAnalysis() {
  const scenario = getScenario();
  const values = scenario.id === "accident" ? [4, 9, 13, 18, 15, 8] : scenario.id === "closure" ? [3, 5, 8, 11, 10, 7] : scenario.id === "weather" ? [2, 4, 7, 12, 14, 13] : [2, 4, 6, 9, 7, 5];
  $("#trendChart").innerHTML = values.map((value, index) => `
    <div class="bar"><div class="bar-fill" style="height:${value * 11}px"></div><span>${index + 1}0分</span></div>
  `).join("");

  const onlineRate = Math.round((scenario.cones.filter((cone) => cone.status !== "off").length / scenario.cones.length) * 100);
  const syncRate = state.synced || scenario.sync === "已同步" ? 96 : 62;
  const boundary = scenario.cones.some((cone) => cone.status === "off") ? 84 : 93;
  $("#qualityList").innerHTML = [
    ["设备在线率", onlineRate],
    ["布设完整度", boundary],
    ["对外同步成功率", syncRate],
    ["告警确认效率", state.dispatched ? 91 : 68]
  ].map(([name, value]) => `
    <div class="quality-row">
      <div><strong>${name}</strong><div class="progress"><i style="width:${value}%"></i></div></div>
      <span>${value}%</span>
    </div>
  `).join("");

  $("#reviewReport").innerHTML = `
    本次演示事件为“${scenario.title}”。系统通过 GPS 自动形成事件边界，结合摄像头识别结果和雷达最近距离判断风险等级。
    当前最近目标距离已纳入告警规则，平台可完成调度派单、车辆端预警同步和事件关闭复盘。
    汇报时可按“发现风险、确认事件、派发处置、同步预警、关闭复盘”的顺序展示完整逻辑。
  `;
}

function nextDemoStep() {
  const steps = [
    () => showToast("步骤 1：路锥上传 GPS 点位，平台自动生成道路临时事件边界。"),
    () => showToast("步骤 2：摄像头识别车辆、行人或路障，为告警提供现场证据。"),
    () => showToast("步骤 3：雷达检测最近距离，触发车辆接近风险判断。"),
    () => {
      state.dispatched = true;
      showToast("步骤 4：调度员确认告警，系统派发现场处置任务。");
    },
    () => {
      state.synced = true;
      showToast("步骤 5：事件范围同步至地图平台和车辆预警接口。");
    },
    () => {
      state.closed = true;
      showToast("步骤 6：现场确认风险解除，系统生成复盘摘要。");
    }
  ];
  steps[state.demoStep % steps.length]();
  state.demoStep += 1;
  renderAll();
}

function playDemo() {
  state.demoStep = 0;
  let count = 0;
  const timer = setInterval(() => {
    nextDemoStep();
    count += 1;
    if (count >= 6) clearInterval(timer);
  }, 1200);
}

function addTimeline(text) {
  getScenario().timeline.push([new Date().toLocaleTimeString("zh-CN", { hour12: false }), text]);
}

function statusLabel(status) {
  return {
    ok: "在线",
    mid: "关注",
    high: "高风险",
    off: "离线"
  }[status] || status;
}

function levelToKey(level) {
  return Object.entries(levelText).find(([, text]) => text === level)?.[0] || "mid";
}

function updateClock() {
  $("#systemClock").textContent = new Date().toLocaleTimeString("zh-CN", { hour12: false });
}

function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("is-visible");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("is-visible"), 2600);
}

init();
