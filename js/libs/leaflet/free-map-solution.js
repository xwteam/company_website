/**
 * 完全免费的地图解决方案
 * 只使用免费且合规的地图服务
 */

class FreeMapSolution {
    constructor(containerId, options = {}) {
        this.containerId = containerId;
        this.container = document.getElementById(containerId);
        this.options = {
            lat: options.lat || 39.9042,
            lng: options.lng || 116.4074,
            zoom: options.zoom || 13,
            ...options
        };
        
        this.init();
    }
    
    init() {
        // 检测是否可以使用Leaflet + OpenStreetMap（完全免费）
        if (window.L && typeof window.L.map === 'function') {
            this.initOpenStreetMap();
        } else {
            this.initStaticMap();
        }
    }
    
    initOpenStreetMap() {
        try {
            // 使用完全免费的OpenStreetMap
            const map = L.map(this.containerId).setView([this.options.lat, this.options.lng], this.options.zoom);
            
            // 添加免费的OpenStreetMap瓦片
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                maxZoom: 19
            }).addTo(map);
            
            // 添加标记
            this.addMarkersToMap(map);
            
        } catch (error) {
            console.warn('OpenStreetMap加载失败，使用静态地图方案:', error);
            this.initStaticMap();
        }
    }
    
    initStaticMap() {
        // 完全静态的地图方案，不依赖任何外部服务
        this.container.innerHTML = `
            <div class="free-map-container" style="
                width: 100%; 
                height: 100%; 
                position: relative; 
                background: linear-gradient(135deg, #74b9ff 0%, #0984e3 100%); 
                border-radius: inherit; 
                overflow: hidden;
                display: flex;
                align-items: center;
                justify-content: center;
            ">
                <div class="location-info" style="
                    background: rgba(255, 255, 255, 0.95); 
                    backdrop-filter: blur(10px); 
                    padding: 40px; 
                    border-radius: 16px; 
                    box-shadow: 0 8px 32px rgba(0,0,0,0.1); 
                    text-align: center; 
                    max-width: 350px; 
                    margin: 20px;
                ">
                    <div style="font-size: 64px; color: #0984e3; margin-bottom: 20px;">
                        <i class="fas fa-map-marker-alt"></i>
                    </div>
                    <h3 style="margin: 0 0 16px 0; color: #2d3436; font-size: 24px; font-weight: 600;">
                        📍 我们的位置
                    </h3>
                    <div style="margin: 20px 0; padding: 16px; background: rgba(116, 185, 255, 0.1); border-radius: 8px;">
                        <p style="margin: 4px 0; color: #636e72; font-size: 14px;">
                            <strong>纬度:</strong> ${this.options.lat}
                        </p>
                        <p style="margin: 4px 0; color: #636e72; font-size: 14px;">
                            <strong>经度:</strong> ${this.options.lng}
                        </p>
                    </div>
                    
                    ${this.renderFreeMapButtons()}
                    
                    <div style="margin-top: 20px; padding-top: 16px; border-top: 1px solid #ddd;">
                        <p style="font-size: 12px; color: #b2bec3; margin: 0;">
                            🌍 使用完全免费的地图服务
                        </p>
                    </div>
                </div>
            </div>
        `;
    }
    
    renderFreeMapButtons() {
        // 只提供完全免费的地图服务链接
        return `
            <div class="free-map-buttons" style="margin-top: 24px; display: flex; flex-direction: column; gap: 12px;">
                <button onclick="window.openFreeMap('${this.options.lat}', '${this.options.lng}', 'openstreetmap')" 
                        style="
                            background: linear-gradient(135deg, #00b894 0%, #00a085 100%); 
                            color: white; 
                            border: none; 
                            padding: 12px 24px; 
                            border-radius: 8px; 
                            cursor: pointer; 
                            font-weight: 500; 
                            transition: all 0.3s ease;
                            font-size: 14px;
                        ">
                    🗺️ OpenStreetMap中查看 (免费)
                </button>
                
                <button onclick="window.openFreeMap('${this.options.lat}', '${this.options.lng}', 'google')" 
                        style="
                            background: linear-gradient(135deg, #4285f4 0%, #3367d6 100%); 
                            color: white; 
                            border: none; 
                            padding: 12px 24px; 
                            border-radius: 8px; 
                            cursor: pointer; 
                            font-weight: 500; 
                            transition: all 0.3s ease;
                            font-size: 14px;
                        ">
                    🌍 Google Maps中查看
                </button>
                
                <button onclick="window.copyCoordinates('${this.options.lat}', '${this.options.lng}')" 
                        style="
                            background: linear-gradient(135deg, #6c5ce7 0%, #5f3dc4 100%); 
                            color: white; 
                            border: none; 
                            padding: 12px 24px; 
                            border-radius: 8px; 
                            cursor: pointer; 
                            font-weight: 500; 
                            transition: all 0.3s ease;
                            font-size: 14px;
                        ">
                    📋 复制坐标
                </button>
            </div>
        `;
    }
    
    addMarkersToMap(map) {
        if (!map) return;
        
        // 创建自定义标记
        const customIcon = L.divIcon({
            className: 'custom-marker',
            html: '<div class="marker-pin"><i class="fas fa-building"></i></div>',
            iconSize: [40, 40],
            iconAnchor: [20, 40],
            popupAnchor: [0, -40]
        });
        
        // 添加标记
        const marker = L.marker([this.options.lat, this.options.lng], {icon: customIcon}).addTo(map);
        
        // 添加弹窗
        const popupContent = `
            <div class="map-popup">
                <h3>${this.options.title || 'Brand Company'}</h3>
                <p><i class="fas fa-map-marker-alt"></i> ${this.options.address || '公司地址'}</p>
                <p><i class="fas fa-phone"></i> ${this.options.phone || '联系电话'}</p>
                <p><i class="fas fa-clock"></i> ${this.options.hours || '营业时间'}</p>
            </div>
        `;
        
        marker.bindPopup(popupContent);
    }
}

// 全局函数：只使用免费地图服务
window.openFreeMap = function(lat, lng, mapType = 'openstreetmap') {
    let mapUrl;
    
    switch (mapType) {
        case 'openstreetmap':
            // OpenStreetMap - 完全免费
            mapUrl = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}&zoom=15`;
            break;
        case 'google':
            // Google Maps - 查看免费，但注意使用限制
            mapUrl = `https://www.google.com/maps?q=${lat},${lng}`;
            break;
        default:
            mapUrl = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}&zoom=15`;
            break;
    }
    
    window.open(mapUrl, '_blank');
};

// 复制坐标功能
window.copyCoordinates = function(lat, lng) {
    const coordinates = `${lat}, ${lng}`;
    
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(coordinates).then(() => {
            showToast('坐标已复制到剪贴板！');
        }).catch(() => {
            fallbackCopyText(coordinates);
        });
    } else {
        fallbackCopyText(coordinates);
    }
};

// 备用复制方法
function fallbackCopyText(text) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    textArea.style.top = "-999999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        document.execCommand('copy');
        showToast('坐标已复制到剪贴板！');
    } catch (err) {
        showToast('复制失败，请手动复制坐标');
    }
    
    document.body.removeChild(textArea);
}

// 简单的toast提示
function showToast(message) {
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #00b894;
        color: white;
        padding: 12px 24px;
        border-radius: 8px;
        z-index: 10000;
        font-size: 14px;
        box-shadow: 0 4px 16px rgba(0,0,0,0.1);
        transition: all 0.3s ease;
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(-20px)';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, 3000);
}

// 暴露到全局
window.FreeMapSolution = FreeMapSolution;