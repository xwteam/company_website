/**
 * 事件处理器模块
 * 处理表单交互和动态功能
 */

// 更新项目标题
window.updateItemTitle = function(input) {
    const titleSpan = input.closest('.array-item').querySelector('.item-title');
    if (titleSpan) {
        const itemNumber = titleSpan.textContent.split(':')[0];
        titleSpan.textContent = `${itemNumber}: ${input.value || '新项目'}`;
    }
};

// 同步筛选器值
window.syncFilterValue = function(input) {
    const value = input.value.toLowerCase().replace(/\s+/g, '-');
    // 对于新的筛选项目，同步到隐藏字段
    const hiddenInput = input.closest('.item-content').querySelector('.filter-value-hidden');
    if (hiddenInput) {
        hiddenInput.value = value;
    }
    // 向后兼容旧的筛选项目
    const valueInput = input.closest('.item-content').querySelector('input[name$=".value"]');
    if (valueInput) {
        valueInput.value = value;
    }
};

// 切换数组项目的展开/收缩
window.toggleArrayItem = function(button) {
    const arrayItem = button.closest('.array-item');
    const content = arrayItem.querySelector('.item-content');
    const icon = button.querySelector('i');
    
    if (content.style.display === 'none') {
        content.style.display = 'block';
        icon.className = 'fas fa-chevron-down';
        arrayItem.classList.remove('collapsed');
    } else {
        content.style.display = 'none';
        icon.className = 'fas fa-chevron-right';
        arrayItem.classList.add('collapsed');
    }
};

// 切换分组的展开/收缩
window.toggleGroup = function(header) {
    const group = header.closest('.collapsible-group');
    const content = group.querySelector('.group-content');
    const icon = header.querySelector('i');
    
    if (content.style.display === 'none') {
        content.style.display = 'block';
        icon.className = 'fas fa-chevron-down';
        group.classList.remove('collapsed');
    } else {
        content.style.display = 'none';
        icon.className = 'fas fa-chevron-right';
        group.classList.add('collapsed');
    }
};

// 移除数组项目
window.removeArrayItem = function(button) {
    const item = button.closest('.array-item');
    item.remove();
    
    // 重新索引剩余项目
    const container = item.closest('.array-container');
    const items = container.querySelectorAll('.array-item');
    items.forEach((item, newIndex) => {
        item.dataset.index = newIndex;
        // 更新所有name属性中的索引
        const inputs = item.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            if (input.name) {
                input.name = input.name.replace(/\[\d+\]/, `[${newIndex}]`);
            }
        });
    });
};