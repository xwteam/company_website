// 简化版Leaflet地图初始化器 - 针对中国地区优化
// 这是一个轻量级实现，如需完整功能请使用官方Leaflet库

class SimpleMap {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        this.lat = options.lat || 39.9042;
        this.lng = options.lng || 116.4074;
        this.zoom = options.zoom || 13;
        this.markers = [];
        this.init();
    }
    
    init() {
        // 创建简单的地图容器
        this.container.innerHTML = `
            <div class="simple-map-container" style="width: 100%; height: 100%; position: relative; background: #f0f0f0; border-radius: inherit;">
                <div class="map-overlay" style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; display: flex; align-items: center; justify-content: center; flex-direction: column; color: #666;">
                    <div class="map-placeholder" style="background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 16px rgba(0,0,0,0.1); text-align: center; max-width: 300px;">
                        <div style="font-size: 48px; color: #007bff; margin-bottom: 16px;">
                            <i class="fas fa-map-marked-alt"></i>
                        </div>
                        <h3 style="margin: 0 0 12px 0; color: #333;">地图位置</h3>
                        <p style="margin: 8px 0; font-size: 14px;">纬度: ${this.lat}</p>
                        <p style="margin: 8px 0; font-size: 14px;">经度: ${this.lng}</p>
                        <div style="margin-top: 20px;">
                            <button onclick="window.openExternalMap('${this.lat}', '${this.lng}')" 
                                    style="background: #007bff; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; margin: 5px;">
                                在地图中查看
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    addMarker(lat, lng, options = {}) {
        this.markers.push({lat, lng, options});
        return this;
    }
    
    setView(lat, lng, zoom) {
        this.lat = lat;
        this.lng = lng;
        this.zoom = zoom;
        this.init();
        return this;
    }
}

// 全局函数：打开外部地图
window.openExternalMap = function(lat, lng) {
    // 检测用户地区并选择合适的地图服务
    const isChinaRegion = navigator.language.includes('zh') || 
                         Intl.DateTimeFormat().resolvedOptions().timeZone.includes('Shanghai');
    
    let mapUrl;
    if (isChinaRegion) {
        // 中国地区优先使用百度地图或高德地图
        mapUrl = `https://uri.amap.com/marker?position=${lng},${lat}&name=公司位置&src=Brand`;
    } else {
        // 其他地区使用Google Maps
        mapUrl = `https://www.google.com/maps?q=${lat},${lng}`;
    }
    
    window.open(mapUrl, '_blank');
};

// 兼容Leaflet API的简化实现
window.L = {
    map: function(containerId) {
        return {
            setView: function(coords, zoom) {
                const mapInstance = new SimpleMap(containerId, {
                    lat: coords[0],
                    lng: coords[1],
                    zoom: zoom
                });
                
                return {
                    addMarker: function(coords, options) {
                        return mapInstance.addMarker(coords[0], coords[1], options);
                    },
                    whenReady: function(callback) {
                        setTimeout(callback, 100);
                    },
                    invalidateSize: function() {
                        // 简化实现，无需操作
                    }
                };
            }
        };
    },
    
    tileLayer: function(url, options) {
        return {
            addTo: function(map) {
                return this;
            }
        };
    },
    
    marker: function(coords, options) {
        return {
            addTo: function(map) {
                return this;
            },
            bindPopup: function(content) {
                return this;
            }
        };
    },
    
    divIcon: function(options) {
        return options;
    }
};