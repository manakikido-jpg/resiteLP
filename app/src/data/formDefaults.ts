/* =========================================================
   予約フォームのデフォルト設定
   予約ページ（reference/booking）の項目構成に合わせた既定値。
   この fields を予約ページが描画し、プロファイル「フォーム項目」が編集する（双方向連携）。
   ========================================================= */
import type { FormField, SlotConfig } from "../lib/types";

/** 47都道府県（予約ページ「お住まい」セレクトの選択肢） */
export const PREFECTURES = [
  "北海道", "青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県",
  "茨城県", "栃木県", "群馬県", "埼玉県", "千葉県", "東京都", "神奈川県",
  "新潟県", "富山県", "石川県", "福井県", "山梨県", "長野県", "岐阜県", "静岡県", "愛知県",
  "三重県", "滋賀県", "京都府", "大阪府", "兵庫県", "奈良県", "和歌山県",
  "鳥取県", "島根県", "岡山県", "広島県", "山口県",
  "徳島県", "香川県", "愛媛県", "高知県",
  "福岡県", "佐賀県", "長崎県", "熊本県", "大分県", "宮崎県", "鹿児島県", "沖縄県", "海外",
];

export const DEFAULT_FORM_FIELDS: FormField[] = [
  { id: "f_name", label: "お名前", type: "text", required: true, placeholder: "例：山田 花子", mapKey: "name" },
  {
    id: "f_phone",
    label: "電話番号",
    type: "tel",
    required: true,
    placeholder: "例：090-0000-0000",
    mapKey: "phone",
    // SMS/メールの自動送信は未実装。実装していない約束は書かない（R-002）
    help: "担当コーチからのご連絡に使います。営業電話には使いません。",
  },
  { id: "f_exp", label: "転職経験", type: "radio", required: false, options: ["なし", "1回", "2回", "3回以上"], mapKey: "exp" },
  { id: "f_age", label: "年齢", type: "radio", required: false, options: ["〜24", "25–29", "30–34", "35–39", "40–44", "45〜"], mapKey: "age" },
  { id: "f_job", label: "現在の職業", type: "text", required: false, placeholder: "例：法人営業、看護師、公務員など", mapKey: "job" },
  { id: "f_loc", label: "お住まい", type: "select", required: false, placeholder: "都道府県を選択", options: PREFECTURES, mapKey: "loc" },
];

export const DEFAULT_SLOT_CONFIG: SlotConfig = {
  weekly: {
    0: { on: false, start: "10:00", end: "18:00" },
    1: { on: true, start: "10:00", end: "19:00" },
    2: { on: true, start: "10:00", end: "19:00" },
    3: { on: true, start: "10:00", end: "19:00" },
    4: { on: true, start: "10:00", end: "19:00" },
    5: { on: true, start: "10:00", end: "20:00" },
    6: { on: true, start: "11:00", end: "17:00" },
  },
  slotMinutes: 60,
  capacity: 2,
  leadDays: 1,
  rangeDays: 30,
  // 既定は休止日なし。以前デモ用の固定日が入っており、form_config 未作成時に
  // 過去日が休止日として設定された状態で立ち上がっていた（R-001）。
  holidays: [],
};
