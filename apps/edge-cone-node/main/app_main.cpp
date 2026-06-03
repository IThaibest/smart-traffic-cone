#include "cone_node_app.h"

#include "esp_log.h"
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"

namespace {
constexpr char kTag[] = "edge_cone_node";
}

extern "C" void app_main(void) {
  ESP_LOGI(kTag, "starting smart traffic cone edge node");

  ConeNodeApp app;
  app.setup();

  while (true) {
    app.tick();
    vTaskDelay(pdMS_TO_TICKS(100));
  }
}
