import React, { useState, useEffect, forwardRef } from 'react';
import type { BaseFormFieldProps } from '@/lib/base-form-props';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandSeparator } from '@/components/ui/command';
import { Checkbox } from '@/components/ui/checkbox';
import { Check, ChevronsUpDown, X, FolderPlus, Folder, ArrowLeft } from 'lucide-react';

const pcaData = [
  {
    "value": "11",
    "label": "北京市",
    "children": [
      {
        "value": "1101",
        "label": "市辖区",
        "children": [
          { "value": "110101", "label": "东城区" },
          { "value": "110102", "label": "西城区" },
          { "value": "110105", "label": "朝阳区" },
          { "value": "110106", "label": "丰台区" },
          { "value": "110107", "label": "石景山区" },
          { "value": "110108", "label": "海淀区" },
          { "value": "110109", "label": "门头沟区" },
          { "value": "110111", "label": "房山区" },
          { "value": "110112", "label": "通州区" },
          { "value": "110113", "label": "顺义区" },
          { "value": "110114", "label": "昌平区" },
          { "value": "110115", "label": "大兴区" },
          { "value": "110116", "label": "怀柔区" },
          { "value": "110117", "label": "平谷区" },
          { "value": "110118", "label": "密云区" },
          { "value": "110119", "label": "延庆区" }
        ]
      }
    ]
  }
]
// ====================== 核心类型定义 ======================
/** 省市区数据结构类型 */
interface PCAItem {
  label: string;
  value: string;
  children?: PCAItem[];
}

/** Form Area Props 类型 */
export interface FormAreaProps
  extends Omit<BaseFormFieldProps, 'value' | 'onChange' | 'onBlur'>,
  Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange' | 'onBlur'> {
  /** 当前值（多选时为数组） */
  value?: string | string[];
  /** 默认值 */
  defaultValue?: string | string[];
  /** 区域类型：p=省 | pc=省市 | pca=省市区 */
  areaType?: 'p' | 'pc' | 'pca';
  /** 是否多选 */
  multiple?: boolean;
  /** 是否禁用 */
  disabled?: boolean;
  /** 值变化回调 */
  onChange?: (value: string | string[]) => void;
}

// ====================== 工具函数（带类型注解） ======================
/** 处理单选级联数据格式 */
const getData = (areaType: 'p' | 'pc' | 'pca', pcaData: PCAItem[]): { value: string; label: string; children?: any[] }[] => {
  if (areaType === 'p') {
    return pcaData.map(item => ({ value: item.label, label: item.label }));
  } else if (areaType === 'pc') {
    return pcaData.map(item => ({
      value: item.label,
      label: item.label,
      children: item.children?.map(child => ({ value: child.label, label: child.label })) || [],
    }));
  } else {
    return pcaData.map(item => ({
      value: item.label,
      label: item.label,
      children: item.children?.map(child => ({
        value: child.label,
        label: child.label,
        children: child.children?.map(grand => ({ value: grand.label, label: grand.label })) || [],
      })) || [],
    }));
  }
};

/** 转换为多选格式的数组 */
const convertToMultipleFormat = (value: unknown): string[] => {
  if (!value) return [];
  if (Array.isArray(value)) return value as string[];
  return [String(value)];
};

/** 生成层级选择数据（适配 Command 递归渲染） */
const getHierarchyData = (areaType: 'p' | 'pc' | 'pca', pcaData: PCAItem[]): any[] => {
  const buildItem = (item: PCAItem, parentPath = '') => {
    const currentPath = parentPath ? `${parentPath}/${item.label}` : item.label;
    const result = {
      value: currentPath,
      label: item.label,
      key: currentPath,
      parentPath,
      hasChildren: !!item.children?.length,
      children: [] as any[],
    };

    // 根据 areaType 控制层级
    const isProvinceLevel = !parentPath;
    const isCityLevel = parentPath && !parentPath.includes('/');

    if (areaType === 'p' && isProvinceLevel) {
      // 仅省级
      return result;
    } else if (areaType === 'pc' && (isProvinceLevel || isCityLevel)) {
      // 省+市级
      result.children = item.children?.map(child => buildItem(child, currentPath)) || [];
      return result;
    } else if (areaType === 'pca') {
      // 省+市+区
      result.children = item.children?.map(child => buildItem(child, currentPath)) || [];
      return result;
    }
    return null;
  };

  return pcaData.map(item => buildItem(item)).filter(Boolean) as any[];
};

// ====================== 核心组件 ======================
const FormArea = forwardRef<HTMLDivElement, FormAreaProps>(
  (
    {
      className,
      value: controlledValue,
      defaultValue,
      areaType = 'pca',
      multiple = false,
      disabled = false,
      onChange
    },
    ref
  ) => {
    // 状态管理
    const [internalValue, setInternalValue] = useState<string | string[]>(
      multiple && Array.isArray(defaultValue) ? defaultValue : (defaultValue as string || '')
    );

    const [selectedValues, setSelectedValues] = useState<string[]>([]); // 多选选中值
    const [open, setOpen] = useState(false); // 下拉面板开关
    const [expandedKeys, setExpandedKeys] = useState<string[]>([]); // 展开的层级key

    // 单选级联核心状态
    const [currentLevel, setCurrentLevel] = useState(0); // 当前级联层级（0=省、1=市、2=区）
    const [selectedPath, setSelectedPath] = useState<string[]>([]); // 单选选中的路径（如 ['浙江省', '杭州市']）

    const isControlled = controlledValue !== undefined;
    const value = isControlled ? controlledValue : internalValue;

    // 加载省市区数据
    useEffect(() => {
      if (multiple) {
        setSelectedValues(convertToMultipleFormat(value));
      }
      // 初始化单选选中路径
      if (!multiple) {
        const rawValue = value as string;
        const displayValue = rawValue || '';
        const path = displayValue.split('/').filter(Boolean);
        setSelectedPath(path);
        setCurrentLevel(path.length > 0 ? path.length - 1 : 0);
      }
    }, [value, multiple]);

    // 切换层级展开/折叠
    const toggleExpand = (key: string) => {
      setExpandedKeys(prev =>
        prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
      );
    };

    // 获取当前层级的数据源
    const getCurrentLevelData = (): any[] => {
      if (currentLevel === 0) {
        return getData(areaType, pcaData);
      }
      // 根据选中路径查找下一级数据
      let currentData = getData(areaType, pcaData);
      for (let i = 0; i < currentLevel; i++) {
        const target = currentData.find(item => item.value === selectedPath[i]);
        if (!target || !target.children) {
          return [];
        }
        currentData = target.children;
      }
      return currentData;
    };

    // 返回上一级
    const handleBack = () => {
      if (currentLevel > 0) {
        setCurrentLevel(prev => prev - 1);
        setSelectedPath(prev => prev.slice(0, currentLevel - 1));
      }
    };

    // 处理值变化
    const handleValueChange = (newValue: string | string[]) => {
      if (!isControlled) {
        setInternalValue(newValue);
      }
      onChange?.(newValue);
    };

    // ====================== 单选级联逻辑 ======================
    const renderSingleSelect = () => {
      const rawValue = value as string;
      const displayValue = rawValue || '';
      // 当前层级的数据源
      const currentData = getCurrentLevelData();
      // 当前层级的选中值
      const currentValue = selectedPath[currentLevel];

      // 级联选择变更处理
      const handleSelect = (itemValue: string) => {
        // 新的选中路径
        const newSelectedPath = [...selectedPath.slice(0, currentLevel), itemValue];
        setSelectedPath(newSelectedPath);

        // 判断是否是最后一级
        const maxLevel = areaType === 'p' ? 0 : areaType === 'pc' ? 1 : 2;
        const isLastLevel = currentLevel >= maxLevel;

        if (isLastLevel) {
          // 最后一级：触发onChange并关闭下拉
          const finalValue = newSelectedPath.join('/');
          handleValueChange(finalValue);
          setOpen(false);
          // 重置层级（下次打开从第一级开始）
          setCurrentLevel(0);
        } else {
          // 非最后一级：切换到下一级
          setCurrentLevel(prev => prev + 1);
        }
      };

      return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              disabled={disabled}
              className={cn("w-full justify-between", className)}
            >
              {displayValue || "请选择"}
              <ChevronsUpDown className="h-4 w-4 ml-2 shrink-0" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-70 p-0">
            <Command className="h-75 overflow-auto">
              <CommandInput placeholder={"请选择区域"} disabled={disabled} />
              <CommandEmpty>未找到匹配项</CommandEmpty>

              {/* 返回上一级按钮 */}
              {currentLevel > 0 && (
                <>
                  <CommandItem
                    key="back"
                    onSelect={handleBack}
                    disabled={disabled}
                    className="flex items-center gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span>{"返回上一级"}</span>
                  </CommandItem>
                  <CommandSeparator />
                </>
              )}

              {/* 渲染当前层级的选项 */}
              <CommandGroup>
                {currentData.map((item) => (
                  <CommandItem
                    key={item.value}
                    value={item.value}
                    disabled={disabled}
                    onSelect={() => handleSelect(item.value)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        item.value === currentValue ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {item.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    };

    // ====================== 多选层级逻辑 ======================
    const renderMultipleSelect = () => {
      const hierarchyData = getHierarchyData(areaType, pcaData);

      // 处理选中状态变更
      const handleCheck = (key: string) => {
        const newSelected = selectedValues.includes(key)
          ? selectedValues.filter(item => item !== key)
          : [...selectedValues, key];
        setSelectedValues(newSelected);
        handleValueChange(newSelected);
      };

      // 清空所有选中项
      const handleClearAll = () => {
        setSelectedValues([]);
        handleValueChange([]);
      };

      // 递归渲染层级选项（模拟树形结构）
      const renderHierarchyItems = (items: any[], depth = 0) => {
        return items.map(item => (
          <div key={item.key} className={cn(`pl-${depth * 16}px`, "py-1")}>
            <div className="flex items-center gap-1">
              {/* 展开/折叠按钮 */}
              {item.hasChildren && (
                <button
                  type="button"
                  onClick={() => toggleExpand(item.key)}
                  disabled={disabled}
                  className="h-4 w-4 flex items-center justify-center text-gray-500"
                >
                  {expandedKeys.includes(item.key) ? (
                    <FolderPlus className="h-3 w-3" />
                  ) : (
                    <Folder className="h-3 w-3" />
                  )}
                </button>
              )}
              {/* 无子集时补位，保持对齐 */}
              {!item.hasChildren && <span className="h-4 w-4"></span>}

              {/* 复选框 + 标签 */}
              <Checkbox
                checked={selectedValues.includes(item.key)}
                onCheckedChange={() => handleCheck(item.key)}
                disabled={disabled}
                className="mr-2"
              />
              <span
                className={cn(
                  "text-sm cursor-pointer",
                  disabled && "text-gray-400 cursor-not-allowed"
                )}
                onClick={() => !disabled && handleCheck(item.key)}
              >
                {item.label}
              </span>
            </div>

            {/* 渲染子级（展开状态下） */}
            {item.hasChildren && expandedKeys.includes(item.key) && (
              <div className="mt-1">
                {renderHierarchyItems(item.children, depth + 1)}
              </div>
            )}
          </div>
        ));
      };

      return (
        <div className={cn("border rounded-md p-2", {
          'opacity-50 cursor-not-allowed': disabled,
          'border-gray-200': !disabled,
        })}>
          {/* 选中项标签 */}
          <div className="flex flex-wrap gap-2 mb-2">
            {selectedValues.map((value) => (
              <div key={value} className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded">
                <span className="text-sm">{value.split('/').pop()}</span>
                <button
                  type="button"
                  onClick={() => handleCheck(value)}
                  disabled={disabled}
                  className="h-4 w-4 rounded-full hover:bg-gray-200 flex items-center justify-center"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            {selectedValues.length > 0 && (
              <button
                type="button"
                onClick={handleClearAll}
                disabled={disabled}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                清空
              </button>
            )}
          </div>

          {/* 层级选择区域（模拟树形） */}
          <div className="max-h-75 overflow-auto pr-2">
            {renderHierarchyItems(hierarchyData)}
          </div>
        </div>
      );
    };

    // 根据多选/单选渲染不同组件
    return multiple ? renderMultipleSelect() : renderSingleSelect();
  }
);

FormArea.displayName = "FormArea";

export { FormArea }
