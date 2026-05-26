import type { CaseFlow } from '../../types';

const flow: CaseFlow = {
  case_type: 'divorce',
  city: '上海',
  province: '上海',
  updated_at: '2025-01-01',
  nodes: [
    {
      id: 'n01',
      step: 1,
      name: '诉前准备与证据收集',
      nodeType: 'start',
      duration: '视情况而定（建议1-4周）',
      materials: [
        { name: '结婚证', required: true, note: '原件，无原件可去民政局补办婚姻登记证明' },
        { name: '双方身份证', required: true },
        { name: '户口本', required: true },
        { name: '子女出生医学证明', required: false, note: '有未成年子女时必须提供' },
        { name: '夫妻共同财产证明', required: false, note: '房产证/网签合同、车辆行驶证、银行存款证明、股票账户等' },
        { name: '婚前财产证明', required: false, note: '主张婚前个人财产时提供，如婚前购房合同、银行记录' },
        { name: '对方过错证据', required: false, note: '出轨、家暴、赌博等，用于主张损害赔偿' },
      ],
      key_points: [
        '上海离婚诉讼按户籍地或居住地确定管辖，外省户籍但上海居住1年以上可在上海起诉',
        '离婚诉讼"不告不理"，对方一定会出庭或提交答辩，提前预判对方策略',
        '房产是争议焦点：婚前全款购房登记一方名下通常为个人财产，婚后共同还贷部分可分割',
        '出轨证据需合法取得，私家侦探取证和偷拍可能不被采纳',
      ],
      warnings: [
        '不要在准备期间转移财产或销毁证据，否则法院可对此作出不利认定',
        '家暴情形应及时去医院就诊并报警，形成证据链',
      ],
    },
    {
      id: 'n02',
      step: 2,
      name: '起诉立案',
      nodeType: 'normal',
      duration: '立案当天或7日内',
      duration_legal: '7日内决定是否受理',
      materials: [
        { name: '离婚起诉状', required: true, note: '一式两份，明确诉请：离婚、子女抚养、财产分割' },
        { name: '结婚证复印件', required: true },
        { name: '身份证复印件', required: true },
        { name: '户口本复印件', required: true },
        { name: '被告身份信息', required: true, note: '用于法院送达，需提供被告现住址或工作单位地址' },
        { name: '证据材料目录', required: true },
        { name: '诉讼费缴纳', required: true, note: '上海离婚案件诉讼费：标准件50元+财产分割部分按比例计算' },
      ],
      key_points: [
        '上海支持网上立案：通过"上海法院诉讼平台"或"上海一网通办"提交材料',
        '立案时需明确诉请，财产分割诉请金额会影响诉讼费',
        '子女抚养权诉请需同时写明抚养费金额（参考被告收入1/4-1/3）',
        '上海各区基层法院均受理离婚案件，按被告住所地管辖',
      ],
      warnings: [
        '诉状诉请需慎重，起诉后轻易撤诉影响后续再次起诉（6个月内不得就同一理由再诉）',
      ],
    },
    {
      id: 'n03',
      step: 3,
      name: '送达与答辩',
      nodeType: 'normal',
      duration: '立案后1-2个月',
      duration_legal: '被告15日内提交答辩状',
      materials: [
        { name: '补充证据（如有）', required: false },
      ],
      key_points: [
        '上海法院一般采用邮寄送达，对方签收后计算答辩期',
        '对方下落不明时需公告送达，耗时约60日，大幅延长整体周期',
        '被告可提出管辖异议，约定处理时间',
      ],
      warnings: [
        '若对方故意规避送达，需收集对方实际居住地证据，协助法院送达',
      ],
    },
    {
      id: 'n04',
      step: 4,
      name: '庭前调解',
      nodeType: 'normal',
      duration: '正式开庭前，通常1-2次',
      materials: [
        { name: '调解方案（内心预案）', required: false, note: '提前想好底线条件，子女归属、财产分割的接受范围' },
      ],
      key_points: [
        '上海法院非常重视调解，法官在开庭前会组织1-2次庭前调解',
        '调解离婚成功率约30%，财产分割调解成功率更高',
        '调解成功出具《民事调解书》，效力与判决书相同，当场生效',
        '上海部分法院引入专业调解员（律师、心理咨询师），效果好于法官单独调解',
      ],
      warnings: [
        '调解阶段不要轻易承诺超出底线的条件，口头承诺可能被对方作为证据',
      ],
    },
    {
      id: 'n05',
      step: 5,
      name: '开庭审理',
      nodeType: 'normal',
      duration: '立案后2-4个月',
      duration_legal: '简易程序3个月，普通程序6个月',
      materials: [
        { name: '身份证原件', required: true },
        { name: '全套证据原件', required: true },
        { name: '质证提纲', required: false, note: '对对方证据进行质疑的提纲' },
      ],
      key_points: [
        '上海离婚案件适用简易程序居多，约3个月内宣判',
        '庭审重点：婚姻破裂事实（感情确已破裂）+ 子女最佳利益 + 财产清单核实',
        '子女抚养权考量：年龄、与父母感情、各方经济条件、子女意愿（10岁以上）',
        '上海房产分割：婚前个人购房一般归个人；婚后共同购房，参与共同还贷部分及增值归共同财产',
      ],
      warnings: [
        '一审判决不准离婚的，可在6个月后再次起诉，第二次起诉法院通常会判准',
        '家暴受害方可申请人身安全保护令，在开庭前即可申请',
      ],
    },
    {
      id: 'n06',
      step: 6,
      name: '一审判决',
      nodeType: 'decision',
      duration: '庭审结束后约1个月内',
      materials: [],
      key_points: [
        '一审判决准予离婚：同时判决子女抚养和财产分割',
        '一审判决不准离婚：6个月后可再次起诉，第二次一般判准',
        '收到判决书15日内可提出上诉',
        '上海法院判决书可在"中国裁判文书网"查询类似案例，预判结果',
      ],
      warnings: [
        '准予离婚判决生效后，双方婚姻关系解除，房产分割等须及时办理过户',
      ],
    },
    {
      id: 'n07',
      step: 7,
      name: '上诉至中级法院',
      nodeType: 'normal',
      duration: '收到判决书15日内',
      duration_legal: '15日内提出',
      materials: [
        { name: '上诉状', required: true, note: '针对一审判决中有异议部分，写明上诉请求和理由' },
        { name: '一审判决书', required: true },
        { name: '新证据', required: false },
      ],
      key_points: [
        '上诉至上海市第一/第二中级人民法院',
        '离婚案件二审一般书面审，3个月内出终审判决',
        '二审维持比例较高，有实质新证据或法律适用错误才有意义',
      ],
      warnings: [
        '上诉期间离婚判决暂不生效，双方仍处于婚姻关系中',
      ],
    },
    {
      id: 'n08',
      step: 7,
      name: '判决生效后办理手续',
      nodeType: 'end',
      duration: '判决生效后尽快办理',
      materials: [
        { name: '生效判决书/调解书', required: true },
        { name: '结婚证', required: true, note: '提交民政局注销' },
        { name: '户口本', required: true },
        { name: '房产过户材料', required: false, note: '不动产登记中心办理，需缴纳过户税费' },
        { name: '子女户籍迁移材料', required: false },
      ],
      key_points: [
        '持判决书去民政局办理离婚登记，领取离婚证（上海已可网上预约）',
        '房产过户：持判决书到不动产登记中心，需双方或一方到场',
        '子女抚养费如对方不履行，直接申请法院强制执行，可从工资中扣划',
        '上海不动产过户免征契税（离婚财产分割），但需核实当前政策',
      ],
      warnings: [
        '判决书生效后尽快完成财产过户，避免对方再次转移财产或设定抵押',
      ],
    },
  ],
  edges: [
    { from: 'n01', to: 'n02' },
    { from: 'n02', to: 'n03' },
    { from: 'n03', to: 'n04' },
    { from: 'n04', to: 'n05', label: '调解不成，继续庭审' },
    { from: 'n04', to: 'n08', label: '调解成功，出具调解书', style: 'success' },
    { from: 'n05', to: 'n06' },
    { from: 'n06', to: 'n08', label: '判决生效，办理手续', style: 'success' },
    { from: 'n06', to: 'n07', label: '不服判决，15日内上诉', style: 'dashed' },
    { from: 'n07', to: 'n08', label: '终审判决生效后办理', style: 'success' },
  ],
};

export default flow;
