// 电商场景数据生成工具

export const randomChoice = <T>(arr: T[]): T =>
  arr[Math.floor(Math.random() * arr.length)];

export const randomInt = (min: number, max: number): number =>
  Math.floor(Math.random() * (max - min + 1)) + min;

export const randomDate = (startYear = 2024, endYear = 2025): string => {
  const year = randomInt(startYear, endYear);
  const month = String(randomInt(1, 12)).padStart(2, '0');
  const day = String(randomInt(1, 28)).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// ===== 商品名 =====
const productNames = [
  'AirPods Pro 2',
  'iPhone 15 手机壳',
  '小米手环 8',
  '机械键盘 K8',
  'MacBook 支架',
  'USB-C 扩展坞',
  '无线充电器',
  '降噪耳机 WH-1000',
  '电动牙刷 T700',
  'iPad 保护套',
  'Switch 手柄',
  '蓝牙音箱 Mini',
  '便携显示器 15.6"',
  '人体工学鼠标',
  '4K 摄像头',
  'Type-C 数据线 2m',
  '手机支架',
  '桌面加湿器',
  '筋膜枪 Mini',
  'LED 台灯',
];

const categories = ['数码配件', '手机周边', '电脑外设', '智能穿戴', '生活电器'];
const customerNames = [
  '张三',
  '李四',
  '王五',
  '赵六',
  '孙七',
  '周八',
  '吴九',
  '郑十',
  '陈一',
  '刘二',
  '黄三',
  '杨四',
  '朱五',
  '秦六',
  '许七',
  '何八',
];
const phones = [
  '138****1234',
  '139****5678',
  '150****9012',
  '186****3456',
  '177****7890',
  '155****2345',
  '188****6789',
  '136****0123',
];

// ===== 1. 商品列表 (BasicTable) =====
export const generateProductList = (count: number) =>
  Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: productNames[i % productNames.length],
    category: randomChoice(categories),
    price: randomInt(19, 2999),
    sales: randomInt(50, 9999),
  }));

// ===== 2. 收支明细 (Sortable) =====
export const generateTransactions = (count: number) => {
  let balance = randomInt(5000, 20000);
  const descs = {
    income: [
      '工资到账',
      '理财收益',
      '红包收入',
      '退款到账',
      '转账收入',
      '奖金',
    ],
    expense: [
      '淘宝购物',
      '外卖订单',
      '话费充值',
      '水电缴费',
      '视频会员',
      '打车费用',
      '超市购物',
      '咖啡',
    ],
  };

  return Array.from({ length: count }, (_, i) => {
    const type = Math.random() > 0.4 ? 'expense' : 'income';
    const amount =
      type === 'income' ? randomInt(100, 8000) : -randomInt(10, 2000);
    balance += amount;
    return {
      id: i + 1,
      date: randomDate(2025, 2025),
      description: randomChoice(descs[type]),
      type,
      amount,
      balance: Math.max(0, balance),
    };
  });
};

// ===== 3. 订单列表 (Expandable) =====
const orderStatuses = ['待付款', '待发货', '运输中', '已完成', '已取消'];

export const generateOrderList = (count: number) =>
  Array.from({ length: count }, (_, i) => {
    const itemCount = randomInt(1, 3);
    const items = Array.from({ length: itemCount }, (__, j) => {
      const price = randomInt(29, 999);
      const qty = randomInt(1, 3);
      return {
        id: `${i + 1}-${j + 1}`,
        name: randomChoice(productNames),
        spec:
          randomChoice(['黑色', '白色', '银色', '蓝色']) +
          ' / ' +
          randomChoice(['标准版', '升级版', '旗舰版']),
        price,
        quantity: qty,
        subtotal: price * qty,
      };
    });
    const total = items.reduce((s, it) => s + it.subtotal, 0);

    return {
      id: `ORD${String(20250001 + i)}`,
      date: randomDate(2025, 2025),
      status: randomChoice(orderStatuses),
      total,
      children: items,
    };
  });

// ===== 4. 商品搜索 (EmptyState) =====
export const generateSearchProducts = (count: number) =>
  Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: productNames[i % productNames.length],
    category: randomChoice(categories),
    price: randomInt(19, 2999),
    stock: randomInt(0, 500),
  }));

// ===== 5. 多规格价格表 (FixedColumn) =====
const clothingNames = [
  '经典T恤',
  '牛仔裤',
  '连帽卫衣',
  '运动短裤',
  '休闲衬衫',
  '羽绒马甲',
  '针织毛衣',
  '工装外套',
];

export const generateSizeChart = (count: number) => {
  const sizes = ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
  return Array.from({ length: count }, (_, i) => {
    const base = randomInt(79, 299);
    const data: { id: number; name: string; [size: string]: string | number } =
      {
        id: i + 1,
        name: clothingNames[i % clothingNames.length],
      };
    sizes.forEach((size, si) => {
      data[size] = randomInt(0, 100) > 15 ? base + si * randomInt(5, 20) : 0;
    });
    return data;
  });
};

// ===== 6. 售后工单 (RightFixed) =====
const issueTypes = [
  '质量问题',
  '尺码不符',
  '物流损坏',
  '发错商品',
  '色差较大',
  '配件缺失',
];
const afterSaleStatuses = ['待处理', '处理中', '已退款', '已换货', '已关闭'];

export const generateAfterSales = (count: number) =>
  Array.from({ length: count }, (_, i) => ({
    id: `AS${String(100001 + i)}`,
    product: randomChoice(productNames),
    issue: randomChoice(issueTypes),
    date: randomDate(2025, 2025),
    status: randomChoice(afterSaleStatuses),
    amount: randomInt(29, 3999),
  }));

// ===== 7. 会员管理 (CustomRender) =====
const memberLevels = ['普通', '银卡', '金卡', '黑卡'];
const memberTags = [
  '高频消费',
  '大额订单',
  '好评达人',
  '新品尝鲜',
  '活动参与',
  '分享达人',
  '回头客',
  '品质买家',
];

export const generateMembers = (count: number) =>
  Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: customerNames[i % customerNames.length],
    phone: phones[i % phones.length],
    level: randomChoice(memberLevels),
    points: randomInt(100, 9999),
    maxPoints: 10000,
    totalSpend: randomInt(500, 50000),
    tags: Array.from({ length: randomInt(2, 4) }, () =>
      randomChoice(memberTags)
    ),
    joinDate: randomDate(2023, 2025),
  }));

// ===== 8. 购物车 (Interactive) =====
export const generateCartItems = (count: number) =>
  Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: productNames[i % productNames.length],
    spec:
      randomChoice(['黑色', '白色', '银色']) +
      ' / ' +
      randomChoice(['标准版', '升级版']),
    price: randomInt(29, 1999),
    quantity: randomInt(1, 3),
  }));

// ===== 9. 商品库存 (Comprehensive) — 复用 generateProducts =====
export const generateInventory = (count: number) => {
  const statuses = ['在售', '缺货', '预售', '下架'];
  const skuColors = ['黑色', '白色', '灰色', '蓝色'];
  const skuSpecs = ['标准版', '升级版', '旗舰版'];

  return Array.from({ length: count }, (_, i) => {
    const basePrice = randomInt(50, 2000);
    const childCount = randomInt(1, 3);
    return {
      id: i + 1,
      name: productNames[i % productNames.length],
      category: randomChoice(categories),
      price: basePrice,
      stock: randomInt(0, 500),
      status: randomChoice(statuses),
      children: Array.from({ length: childCount }, (__, ci) => ({
        id: `${i + 1}-${ci + 1}`,
        name: randomChoice(skuColors) + ' / ' + randomChoice(skuSpecs),
        category: '',
        price: basePrice + randomInt(-20, 50),
        stock: randomInt(0, 100),
        status: randomInt(0, 100) > 20 ? '在售' : '缺货',
      })),
    };
  });
};

// ===== 10. 交易流水 (Performance) =====
const tradeTypes = ['消费', '退款', '充值', '提现', '转账'];
const tradeTargets = [
  '淘宝商城',
  '京东自营',
  '美团外卖',
  '滴滴出行',
  '微信好友',
  '支付宝转账',
  '话费充值',
  '水电缴费',
  '理财产品',
  '信用卡还款',
];

export const generateTradeRecords = (count: number) =>
  Array.from({ length: count }, (_, i) => {
    const type = randomChoice(tradeTypes);
    const isPositive = type === '退款' || type === '充值';
    const amount = isPositive ? randomInt(10, 5000) : -randomInt(10, 5000);
    return {
      id: `TXN${String(1000001 + i)}`,
      type,
      target: randomChoice(tradeTargets),
      amount,
      date: randomDate(2024, 2025),
    };
  });

// ===== 排序工具 =====
export const sortData = <T>(
  data: T[],
  key: string,
  sort: 'asc' | 'desc'
): T[] =>
  [...data].sort((a, b) => {
    const aVal = (a as any)[key];
    const bVal = (b as any)[key];
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return sort === 'asc' ? aVal - bVal : bVal - aVal;
    }
    const aStr = String(aVal).toLowerCase();
    const bStr = String(bVal).toLowerCase();
    return sort === 'asc' ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
  });
