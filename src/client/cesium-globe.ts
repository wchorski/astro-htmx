import * as Cesium from "cesium";
import "cesium/Build/Cesium/Widgets/widgets.css";

const { CESIUM_ION_KEY } = import.meta.env;
if (CESIUM_ION_KEY) {
  Cesium.Ion.defaultAccessToken = CESIUM_ION_KEY;
}

const viewer = new Cesium.Viewer("cesiumContainer", {
  timeline: false,
  animation: false,
  baseLayerPicker: false,
  sceneModePicker: false,
  navigationHelpButton: false,
  // ✅ NO terrainProvider
});

// Load GeoJSON
const dataSource = await Cesium.GeoJsonDataSource.load("/places.geojson", {
  clampToGround: true,
});

viewer.dataSources.add(dataSource);

// Pick one random entity
const entities = dataSource.entities.values;
const randomIndex = Math.floor(Math.random() * entities.length);
const chosen = entities[randomIndex];

// Hide all others
for (const entity of entities) {
  if (entity !== chosen) {
    entity.show = false;
  }
}

// Fly to the selected feature

viewer.flyTo(chosen, {
  duration: 20.0,
  maximumHeight: 10_000,

  offset: new Cesium.HeadingPitchRange(0, -Math.PI / 2, 500),
});

const pinBuilder = new Cesium.PinBuilder();

for (const entity of dataSource.entities.values) {
  // --- PIN ---
  entity.billboard = new Cesium.BillboardGraphics({
    image: pinBuilder.fromColor(Cesium.Color.RED, 48).toDataURL(),
    verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
  });

  // --- LABEL ---
  const names = entity.properties?.names?.getValue(viewer.clock.currentTime);

  const name = names?.primary;

  if (name) {
    entity.label = new Cesium.LabelGraphics({
      text: name,
      font: "14px sans-serif",
      fillColor: Cesium.Color.WHITE,
      outlineColor: Cesium.Color.BLACK,
      outlineWidth: 2,
      style: Cesium.LabelStyle.FILL_AND_OUTLINE,

      showBackground: true,
      backgroundColor: Cesium.Color.BLACK.withAlpha(0.7),

      // ✅ THIS CONTROLS BACKGROUND SIZE
      backgroundPadding: new Cesium.Cartesian2(10, 6),

      pixelOffset: new Cesium.Cartesian2(0, -36),
      show: true,

      // ✅ KEY FIX
      disableDepthTestDistance: Number.POSITIVE_INFINITY,
    });
  }
}
