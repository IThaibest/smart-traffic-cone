cmake_minimum_required(VERSION 3.16)

set(EXTRA_COMPONENT_DIRS
    ../../components/cone_device
)

include($ENV{IDF_PATH}/tools/cmake/project.cmake)
project(edge_cone_node)
