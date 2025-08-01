/**
 * 中国友好地图组件
 * 支持多种地图服务，针对中国地区访问优化
 */

class ChinaFriendlyMap {
    constructor(containerId, options = {}) {
        this.containerId = containerId;
        this.container = document.getElementById(containerId);
        this.options = {
            lat: options.lat || 39.9042,
            lng: options.lng || 116.4074,
            zoom: options.zoom || 13,
            fallbackMode: options.fallbackMode || 'simple',
            ...options
        };
        
        this.markers = [];
        this.isLoaded = false;
        this.init();
    }
    
    async init() {
        // 检测是否可以访问外部地图服务
        const canAccessMaps = await this.testMapAccess();
        
        if (canAccessMaps && window.L && typeof window.L.map === 'function') {
            this.initLeafletMap();
        } else {
            this.initFallbackMap();
        }
    }
    
    async testMapAccess() {
        return new Promise((resolve) => {
            const timeout = setTimeout(() => resolve(false), 3000);
            
            const img = new Image();
            img.onload = () => {
                clearTimeout(timeout);
                resolve(true);
            };
            img.onerror = () => {
                clearTimeout(timeout);
                resolve(false);
            };
            
            // 测试OpenStreetMap瓦片访问
            img.src = 'https://tile.openstreetmap.org/1/0/0.png';
        });
    }
    
    initLeafletMap() {
        try {
            // 使用Leaflet创建地图
            const map = L.map(this.containerId).setView([this.options.lat, this.options.lng], this.options.zoom);
            
            // 根据地区选择地图服务
            const isChina = this.isInChina();
            
            if (isChina) {
                // 中国地区使用国内地图服务
                this.addChinaTileLayer(map);
            } else {
                // 其他地区使用OpenStreetMap
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '© OpenStreetMap contributors',
                    maxZoom: 19
                }).addTo(map);
            }
            
            this.map = map;
            this.isLoaded = true;
            
            // 添加标记
            this.addMarkersToLeaflet();
            
        } catch (error) {
            console.warn('Leaflet地图初始化失败，使用备用方案:', error);
            this.initFallbackMap();
        }
    }
    
    addChinaTileLayer(map) {
        // 使用多个国内地图服务作为备选
        const chinaTileLayers = [
            {
                name: 'Gaode',
                url: 'https://webrd01.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}',
                attribution: '© 高德地图'
            },
            {
                name: 'Tencent',
                url: 'https://rt{s}.map.gtimg.com/realtimerender?z={z}&x={x}&y={y}&type=vector&style=0',
                subdomains: '0123',
                attribution: '© 腾讯地图'
            }
        ];
        
        // 尝试使用第一个可用的服务
        const layer = L.tileLayer(chinaTileLayers[0].url, {
            attribution: chinaTileLayers[0].attribution,
            maxZoom: 19
        });
        
        layer.addTo(map);
    }
    
    initFallbackMap() {
        // 创建简化的地图界面
        this.container.innerHTML = `
            <div class="china-map-container" style="width: 100%; height: 100%; position: relative; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: inherit; overflow: hidden;">
                <div class="map-content" style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; display: flex; align-items: center; justify-content: center;">
                    <div class="location-card" style="background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(10px); padding: 40px; border-radius: 16px; box-shadow: 0 8px 32px rgba(0,0,0,0.1); text-align: center; max-width: 350px; margin: 20px;">
                        <div class="location-icon" style="font-size: 64px; color: #667eea; margin-bottom: 20px;">
                            <i class="fas fa-map-marker-alt"></i>
                        </div>
                        <h3 style="margin: 0 0 16px 0; color: #333; font-size: 24px; font-weight: 600;">我们的位置</h3>
                        <div class="coordinates" style="margin: 16px 0; padding: 16px; background: rgba(102, 126, 234, 0.1); border-radius: 8px;">
                            <p style="margin: 4px 0; color: #666; font-size: 14px;"><strong>纬度:</strong> ${this.options.lat}</p>
                            <p style="margin: 4px 0; color: #666; font-size: 14px;"><strong>经度:</strong> ${this.options.lng}</p>
                        </div>
                        ${this.renderLocationButtons()}
                    </div>
                </div>
            </div>
        `;
        
        this.isLoaded = true;
    }
    
    renderLocationButtons() {
        const isChina = this.isInChina();
        
        if (isChina) {
            return `
                <div class="map-buttons" style="margin-top: 24px; display: flex; flex-direction: column; gap: 12px;">
                    <button onclick="window.openChinaMap('${this.options.lat}', '${this.options.lng}', 'gaode')" 
                            style="background: linear-gradient(135deg, #00D4AA 0%, #00A98E 100%); color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-weight: 500; transition: all 0.3s ease;">
                        <i class="fas fa-map"></i> 高德地图中查看
                    </button>
                    <button onclick="window.openChinaMap('${this.options.lat}', '${this.options.lng}', 'baidu')" 
                            style="background: linear-gradient(135deg, #3385ff 0%, #1765cc 100%); color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-weight: 500; transition: all 0.3s ease;">
                        <i class="fas fa-compass"></i> 百度地图中查看
                    </button>
                    <button onclick="window.openChinaMap('${this.options.lat}', '${this.options.lng}', 'tencent')" 
                            style="background: linear-gradient(135deg, #1AAD19 0%, #0E7A0E 100%); color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-weight: 500; transition: all 0.3s ease;">
                        <i class="fas fa-location-arrow"></i> 腾讯地图中查看
                    </button>
                </div>
            `;
        } else {
            return `
                <div class="map-buttons" style="margin-top: 24px;">
                    <button onclick="window.openChinaMap('${this.options.lat}', '${this.options.lng}', 'google')" 
                            style="background: linear-gradient(135deg, #4285f4 0%, #3367d6 100%); color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-weight: 500; width: 100%;">
                        <i class="fas fa-globe"></i> Google地图中查看
                    </button>
                </div>
            `;
        }
    }
    
    isInChina() {
        // 检测用户是否在中国地区
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const language = navigator.language;
        
        return timezone.includes('Shanghai') || 
               timezone.includes('Beijing') || 
               language.includes('zh-CN') ||
               language.includes('zh');
    }
    
    addMarkersToLeaflet() {
        if (!this.map || !this.isLoaded) return;
        
        this.markers.forEach(marker => {
            const leafletMarker = L.marker([marker.lat, marker.lng], marker.options).addTo(this.map);
            if (marker.popup) {
                leafletMarker.bindPopup(marker.popup);
            }
        });
    }
    
    addMarker(lat, lng, options = {}) {
        const marker = {
            lat: lat,
            lng: lng,
            options: options,
            popup: options.popup || null
        };
        
        this.markers.push(marker);
        
        if (this.isLoaded && this.map) {
            const leafletMarker = L.marker([lat, lng], options).addTo(this.map);
            if (options.popup) {
                leafletMarker.bindPopup(options.popup);
            }
        }
        
        return this;
    }
    
    setView(lat, lng, zoom) {
        this.options.lat = lat;
        this.options.lng = lng;
        this.options.zoom = zoom;
        
        if (this.map && this.isLoaded) {
            this.map.setView([lat, lng], zoom);
        } else {
            this.init();
        }
        
        return this;
    }
}

// 全局函数：打开各种地图服务
window.openChinaMap = function(lat, lng, mapType = 'auto') {
    let mapUrl;
    
    switch (mapType) {
        case 'gaode':
            mapUrl = `https://uri.amap.com/marker?position=${lng},${lat}&name=公司位置&src=Brand`;
            break;
        case 'baidu':
            mapUrl = `https://api.map.baidu.com/marker?location=${lat},${lng}&title=公司位置&content=Brand&output=html&src=Brand`;
            break;
        case 'tencent':
            mapUrl = `https://apis.map.qq.com/uri/v1/marker?marker=coord:${lat},${lng};title:公司位置&referer=Brand`;
            break;
        case 'google':
        default:
            mapUrl = `https://www.google.com/maps?q=${lat},${lng}`;
            break;
    }
    
    window.open(mapUrl, '_blank');
};

// 暴露到全局
window.ChinaFriendlyMap = ChinaFriendlyMap;