/**
 * 管理面板核心类
 * 负责基础配置管理和数据转换
 */

class ConfigFormEditor {
    constructor() {
        this.currentConfig = null;
        this.currentConfigKey = null;
        this.formValidators = {};
        this.formGenerators = {};
    }

    // 注册表单生成器
    registerFormGenerator(configKey, generator) {
        this.formGenerators[configKey] = generator;
    }

    // 根据配置文件类型生成对应表单
    generateForm(configKey, config) {
        this.currentConfig = config;
        this.currentConfigKey = configKey;

        // 使用注册的生成器
        if (this.formGenerators[configKey]) {
            return this.formGenerators[configKey](config);
        }

        // 默认JSON编辑模式
        return `<div class="form-section">
            <h3><i class="fas fa-file"></i> ${configKey} 配置</h3>
            <p>此配置文件暂时使用JSON编辑模式。</p>
            <textarea name="raw-json" class="json-editor" rows="20">${JSON.stringify(config, null, 2)}</textarea>
        </div>`;
    }

    // 从表单数据转换回JSON配置
    formDataToConfig(formData) {
        const config = {};
        
        // 处理嵌套字段（如 hero-content.title）
        for (const [key, value] of formData.entries()) {
            if (key === 'raw-json') {
                // JSON编辑模式
                try {
                    return JSON.parse(value);
                } catch (e) {
                    throw new Error('JSON格式错误: ' + e.message);
                }
            }
            
            // 跳过空值以避免覆盖隐藏字段的值
            if (value !== '') {
                this.setNestedValue(config, key, value);
            }
        }
        
        // 处理数组字段的特殊格式转换
        this.processArrayFields(config);
        
        // 确保过滤器的label和value同步
        this.syncFilterLabelsAndValues(config);
        
        return config;
    }

    // 设置嵌套对象的值
    setNestedValue(obj, path, value) {
        const keys = path.split('.');
        let current = obj;
        
        for (let i = 0; i < keys.length - 1; i++) {
            const key = keys[i];
            
            // 处理数组索引，如 items[0]
            const arrayMatch = key.match(/^(.+)\[(\d+)\]$/);
            if (arrayMatch) {
                const arrayKey = arrayMatch[1];
                const index = parseInt(arrayMatch[2]);
                
                if (!current[arrayKey]) current[arrayKey] = [];
                if (!current[arrayKey][index]) current[arrayKey][index] = {};
                current = current[arrayKey][index];
            } else {
                if (!current[key]) current[key] = {};
                current = current[key];
            }
        }
        
        const lastKey = keys[keys.length - 1];
        
        // 处理最后一个键的数组索引
        const arrayMatch = lastKey.match(/^(.+)\[(\d+)\]$/);
        if (arrayMatch) {
            const arrayKey = arrayMatch[1];
            const index = parseInt(arrayMatch[2]);
            
            if (!current[arrayKey]) current[arrayKey] = [];
            current[arrayKey][index] = this.convertValue(value);
        } else {
            current[lastKey] = this.convertValue(value);
        }
    }

    // 转换值的类型
    convertValue(value) {
        if (value === '') return '';
        if (value === 'true') return true;
        if (value === 'false') return false;
        if (/^\d+$/.test(value)) return parseInt(value);
        if (/^\d+\.\d+$/.test(value)) return parseFloat(value);
        return value;
    }

    // 处理数组字段的特殊转换
    processArrayFields(config) {
        // 转换特色字段（逗号分隔的字符串转数组）
        this.processServiceFeatures(config);
    }

    // 处理服务特色字段
    processServiceFeatures(config) {
        if (config.services && Array.isArray(config.services)) {
            config.services.forEach(service => {
                if (service.features && typeof service.features === 'string') {
                    service.features = service.features.split(',').map(f => f.trim()).filter(f => f);
                }
            });
        }
    }

    // 同步过滤器的label和value
    syncFilterLabelsAndValues(config) {
        if (config.filters && Array.isArray(config.filters)) {
            config.filters.forEach(filter => {
                if (filter.label && !filter.value) {
                    // 如果有label但没有value，自动生成value
                    filter.value = filter.label.toLowerCase().replace(/\s+/g, '-');
                } else if (filter.label && filter.value !== filter.label.toLowerCase().replace(/\s+/g, '-')) {
                    // 确保value与label同步
                    filter.value = filter.label.toLowerCase().replace(/\s+/g, '-');
                }
            });
        }
    }
}

// 创建全局实例
window.configFormEditor = new ConfigFormEditor();