import type { CaseFlow } from '../../types';

const flow: CaseFlow = {
  case_type: 'labor',
  city: '北京',
  province: '北京',
  updated_at: '2025-01-01',
  nodes: [
    {
      id: 'n01',
      step: 1,
      name: '申请劳动仲裁',
      nodeType: 'start',
      duration: '提交当天',
      duration_legal: '5个工作日内决定是否受理',
      materials: [
        { name: '劳动仲裁申请书', required: true, note: '一式三份，北京市仲裁委网站有模板下载' },
        { name: '申请人身份证复印件', required: true, note: '正反面各一份' },
        { name: '劳动合同或劳动关系证明', required: true, note: '无合同可提供工资条、考勤、工作邮件等替代' },
        { name: '工资流水', required: false, note: '6个月银行流水，主张欠薪时必须提供' },
        { name: '用人单位营业执照', required: false, note: '可从国家企业信用信息公示系统打印' },
        { name: '离职证明或解除通知', required: false, note: '已离职的需提供' },
      ],
      key_points: [
        '北京仲裁委按用人单位所在地区进行管辖，共16个区仲裁委',
        '北京支持网上申请，登录"北京劳动仲裁网上服务平台"提交',
        '申请时效1年，劳动关系存续期间欠薪时效从终止劳动关系之日起算',
        '北京各区仲裁委工作量不均衡，朝阳、海淀案件量大，审理周期相对较长',
      ],
      warnings: [
        '北京管辖规则严格按注册地区划分，不得跨区申请',
        '注意区分劳动争议（1年时效）和劳务争议（3年时效，适用合同法）',
      ],
    },
    {
      id: 'n02',
      step: 2,
      name: '仲裁委审查立案',
      nodeType: 'normal',
      duration: '5个工作日',
      duration_legal: '5个工作日内决定受理',
      materials: [
        { name: '补充材料', required: false, note: '接到补充通知后需在规定时限内提交' },
      ],
      key_points: [
        '北京网上立案后可在线跟踪进度',
        '不予受理的15日内可向北京基层法院起诉',
        '立案成功后仲裁委向被申请人送达答辩通知',
      ],
      warnings: [
        '北京各区仲裁委案件积压情况不同，部分区开庭排期可能较长，做好预期管理',
      ],
    },
    {
      id: 'n03',
      step: 3,
      name: '答辩与证据交换',
      nodeType: 'normal',
      duration: '被申请人10日内答辩',
      duration_legal: '答辩期10日',
      materials: [
        { name: '证据目录及材料（装订成册）', required: true, note: '分类整理，时间线清晰，每份证据注明证明目的' },
        { name: '电子证据公证件', required: false, note: '微信记录、钉钉记录等建议公证，北京公证处可预约' },
      ],
      key_points: [
        '北京仲裁委要求证据材料按规范格式装订，提前电话确认本委具体要求',
        '北京法院对电子证据要求较严，重要电子证据务必公证',
        '可申请仲裁委向社保局、工商部门调取用人单位相关记录',
      ],
      warnings: [
        '北京案件量大，证据材料需特别规范，避免被退回补充',
      ],
    },
    {
      id: 'n04',
      step: 4,
      name: '仲裁庭审',
      nodeType: 'normal',
      duration: '受理后约40-60日',
      duration_legal: '45日内结案，可延长15日',
      materials: [
        { name: '身份证原件', required: true },
        { name: '证据原件', required: true },
        { name: '授权委托书', required: false, note: '委托代理人时提交，需公证（非当事人直系亲属代理时）' },
      ],
      key_points: [
        '北京部分区仲裁委开庭通知晚，实际开庭可能在受理后45-60日',
        '北京庭审较规范，建议律师代理，特别是争议金额较大的案件',
        '北京朝阳、海淀区仲裁委设有专门调解员，庭前调解成功率约30%',
      ],
      warnings: [
        '北京庭审对程序要求严格，陈述、举证、质证三阶段不得混淆',
      ],
    },
    {
      id: 'n05',
      step: 5,
      name: '仲裁裁决',
      nodeType: 'decision',
      duration: '庭审后15-30日',
      duration_legal: '45日内作出裁决',
      materials: [],
      key_points: [
        '北京一裁终局适用范围：劳动报酬、工伤医疗费、经济补偿等不超过12个月最低工资',
        '北京当前最低工资标准2420元/月（2024年），一裁终局上限约29040元',
        '双方收到裁决书后各自15日内决定是否起诉',
      ],
      warnings: [
        '北京法院对劳动案件受理较快，如决定起诉需尽快准备起诉材料',
      ],
    },
    {
      id: 'n06',
      step: 6,
      name: '申请强制执行',
      nodeType: 'end',
      duration: '裁决/判决生效后2年内',
      duration_legal: '申请执行时效2年',
      materials: [
        { name: '申请执行书', required: true },
        { name: '生效法律文书原件', required: true },
        { name: '身份证复印件', required: true },
        { name: '被执行人财产线索', required: false, note: '银行账户、车辆、不动产信息' },
      ],
      key_points: [
        '向被执行人住所地或财产所在地基层法院申请',
        '北京法院执行系统可网上申请，"北京法院审判信息网"提交',
        '可申请法院查询对方银行账户（无需自行提供具体账号）',
      ],
      warnings: [
        '北京执行案件较多，执行周期可能较长，保持与执行法官沟通',
      ],
    },
    {
      id: 'n07',
      step: 6,
      name: '向法院提起诉讼',
      nodeType: 'normal',
      duration: '收到裁决书15日内',
      duration_legal: '15日不起诉则裁决生效',
      materials: [
        { name: '民事起诉状', required: true, note: '一式三份' },
        { name: '仲裁裁决书复印件', required: true },
        { name: '身份证复印件', required: true },
        { name: '证据材料（重新整理装订）', required: true },
      ],
      key_points: [
        '向用人单位所在地区基层法院起诉，北京各区均有基层法院',
        '劳动争议免收诉讼费',
        '北京法院支持网上立案，"北京移动微法院"小程序提交',
        '北京劳动案件法官专业度高，起诉需有明确的法律依据和事实依据',
      ],
      warnings: [
        '北京法院立案审查较严，起诉材料格式和内容须规范',
        '起诉后进入法院流程，整体周期比仲裁阶段更长',
      ],
    },
    {
      id: 'n08',
      step: 7,
      name: '一审立案与庭审',
      nodeType: 'normal',
      duration: '立案后3-6个月',
      duration_legal: '简易程序3个月，普通程序6个月',
      materials: [
        { name: '补充证据', required: false, note: '开庭前7日提交，否则可能不予采纳' },
      ],
      key_points: [
        '北京劳动案件多适用简易程序，实际约3-5个月',
        '北京法院调解率较高，法官会多次组织调解，可争取调解结案',
        '北京劳动案件胜诉率：劳动者约60-70%（以工资、补偿类为主）',
      ],
      warnings: [
        '法院庭审比仲裁更正式，建议委托律师',
      ],
    },
    {
      id: 'n09',
      step: 8,
      name: '上诉至中级法院',
      nodeType: 'normal',
      duration: '收到判决书15日内',
      duration_legal: '15日内上诉，逾期判决生效',
      materials: [
        { name: '上诉状', required: true, note: '写明上诉请求和理由' },
        { name: '一审判决书', required: true },
        { name: '新证据（如有）', required: false },
      ],
      key_points: [
        '上诉至北京市第一中级/第二中级/第三中级法院（按一审法院管辖区域）',
        '二审以书面审理为主，3个月内出终审判决',
        '终审判决发生法律效力，如认为有误可申请再审（标准极高）',
      ],
      warnings: [
        '无实质新证据或法律适用错误时，二审维持原判概率约80%',
      ],
    },
  ],
  edges: [
    { from: 'n01', to: 'n02' },
    { from: 'n02', to: 'n03' },
    { from: 'n03', to: 'n04' },
    { from: 'n04', to: 'n05' },
    { from: 'n05', to: 'n06', label: '接受裁决 / 申请执行', style: 'success' },
    { from: 'n05', to: 'n07', label: '不服裁决，15日内起诉', style: 'warning' },
    { from: 'n07', to: 'n08' },
    { from: 'n08', to: 'n06', label: '判决生效后申请执行', style: 'success' },
    { from: 'n08', to: 'n09', label: '不服判决，15日内上诉', style: 'dashed' },
    { from: 'n09', to: 'n06', label: '终审判决生效后执行', style: 'success' },
  ],
};

export default flow;
