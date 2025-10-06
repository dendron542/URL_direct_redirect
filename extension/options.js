// DOM要素の取得
const rule_name_input = document.getElementById('ruleName');
const source_url_input = document.getElementById('sourceUrl');
const target_url_input = document.getElementById('targetUrl');
const match_type_select = document.getElementById('matchType');
const add_rule_btn = document.getElementById('addRuleBtn');
const rules_list_div = document.getElementById('rulesList');
const status_message_div = document.getElementById('statusMessage');

// 編集モードの状態管理
let editing_index = null;

// ルールを読み込んで表示
async function load_rules() {
  try {
    const data = await chrome.storage.local.get('rules');
    const rules = data.rules || [];
    display_rules(rules);
  } catch (error) {
    show_status(`エラー: ${error.message}`, 'error');
  }
}

// ルールを表示
function display_rules(rules) {
  if (rules.length === 0) {
    rules_list_div.innerHTML = '<p class="no-rules">登録されているルールはありません</p>';
    return;
  }

  rules_list_div.innerHTML = '';

  rules.forEach((rule, index) => {
    const rule_item = document.createElement('div');
    rule_item.className = 'rule-item';

    const match_type_label = {
      'exact': '完全一致',
      'partial': '部分一致',
      'regex': '正規表現'
    };

    // ルール名の表示部分を構築
    const rule_name_html = rule.name ? `
      <div class="rule-name">
        ${escape_html(rule.name)}
      </div>
    ` : '';

    rule_item.innerHTML = `
      <div class="rule-header">
        <label class="toggle-label">
          <input type="checkbox" class="toggle-checkbox" data-index="${index}" ${rule.enabled ? 'checked' : ''} />
          <span class="toggle-text">${rule.enabled ? '有効' : '無効'}</span>
        </label>
        <div class="rule-actions">
          <button class="btn btn-secondary btn-small edit-btn" data-index="${index}">編集</button>
          <button class="btn btn-danger btn-small delete-btn" data-index="${index}">削除</button>
        </div>
      </div>
      ${rule_name_html}
      <div class="rule-details">
        <div class="rule-info">
          <strong>元URL:</strong> <code>${escape_html(rule.sourceUrl)}</code>
        </div>
        <div class="rule-info">
          <strong>先URL:</strong> <code>${escape_html(rule.targetUrl)}</code>
        </div>
        <div class="rule-info">
          <strong>一致方法:</strong> ${match_type_label[rule.matchType]}
        </div>
      </div>
    `;

    rules_list_div.appendChild(rule_item);
  });

  // イベントリスナーを追加
  document.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', handle_edit_rule);
  });

  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', handle_delete_rule);
  });

  document.querySelectorAll('.toggle-checkbox').forEach(checkbox => {
    checkbox.addEventListener('change', handle_toggle_rule);
  });
}

// ルールを追加または更新
async function add_rule() {
  const rule_name = rule_name_input.value.trim();
  const source_url = source_url_input.value.trim();
  const target_url = target_url_input.value.trim();
  const match_type = match_type_select.value;

  // バリデーション
  if (!source_url || !target_url) {
    show_status('URLを入力してください', 'error');
    return;
  }

  // 正規表現の場合、正しい形式かチェック
  if (match_type === 'regex') {
    try {
      new RegExp(source_url);
    } catch (e) {
      show_status('正規表現の形式が正しくありません', 'error');
      return;
    }
  }

  try {
    // 既存のルールを取得
    const data = await chrome.storage.local.get('rules');
    const rules = data.rules || [];

    if (editing_index !== null) {
      // 編集モード: 既存のルールを更新
      rules[editing_index].name = rule_name || '';
      rules[editing_index].sourceUrl = source_url;
      rules[editing_index].targetUrl = target_url;
      rules[editing_index].matchType = match_type;
    } else {
      // 追加モード: 新しいルールを追加
      const new_rule = {
        id: Date.now().toString(),
        name: rule_name || '',
        sourceUrl: source_url,
        targetUrl: target_url,
        matchType: match_type,
        enabled: true
      };
      rules.push(new_rule);
    }

    // ストレージに保存
    await chrome.storage.local.set({ rules: rules });

    // バックグラウンドスクリプトにルール更新を通知
    await chrome.runtime.sendMessage({ action: 'updateRules' });

    // 入力フォームをクリア
    reset_form();

    // ルールを再読み込み
    await load_rules();

    show_status(editing_index !== null ? 'ルールを更新しました' : 'ルールを追加しました', 'success');
    editing_index = null;
  } catch (error) {
    show_status(`エラー: ${error.message}`, 'error');
  }
}

// ルールを削除
async function handle_delete_rule(event) {
  const index = parseInt(event.target.dataset.index);

  try {
    const data = await chrome.storage.local.get('rules');
    const rules = data.rules || [];

    // ルールを削除
    rules.splice(index, 1);

    // ストレージに保存
    await chrome.storage.local.set({ rules: rules });

    // バックグラウンドスクリプトにルール更新を通知
    await chrome.runtime.sendMessage({ action: 'updateRules' });

    // ルールを再読み込み
    await load_rules();

    show_status('ルールを削除しました', 'success');
  } catch (error) {
    show_status(`エラー: ${error.message}`, 'error');
  }
}

// ルールの有効/無効を切り替え
async function handle_toggle_rule(event) {
  const index = parseInt(event.target.dataset.index);
  const enabled = event.target.checked;

  try {
    const data = await chrome.storage.local.get('rules');
    const rules = data.rules || [];

    // ルールの有効/無効を更新
    rules[index].enabled = enabled;

    // ストレージに保存
    await chrome.storage.local.set({ rules: rules });

    // バックグラウンドスクリプトにルール更新を通知
    await chrome.runtime.sendMessage({ action: 'updateRules' });

    // ルールを再読み込み
    await load_rules();

    show_status(`ルールを${enabled ? '有効' : '無効'}にしました`, 'success');
  } catch (error) {
    show_status(`エラー: ${error.message}`, 'error');
  }
}

// ルールを編集
async function handle_edit_rule(event) {
  const index = parseInt(event.target.dataset.index);

  try {
    const data = await chrome.storage.local.get('rules');
    const rules = data.rules || [];
    const rule = rules[index];

    // フォームに既存の値を読み込む
    rule_name_input.value = rule.name || '';
    source_url_input.value = rule.sourceUrl;
    target_url_input.value = rule.targetUrl;
    match_type_select.value = rule.matchType;

    // 編集モードに切り替え
    editing_index = index;
    add_rule_btn.textContent = 'ルールを更新';
    add_rule_btn.classList.remove('btn-primary');
    add_rule_btn.classList.add('btn-warning');

    // フォームまでスクロール
    window.scrollTo({ top: 0, behavior: 'smooth' });

    show_status('編集モード: 変更後、「ルールを更新」をクリックしてください', 'info');
  } catch (error) {
    show_status(`エラー: ${error.message}`, 'error');
  }
}

// フォームをリセット
function reset_form() {
  rule_name_input.value = '';
  source_url_input.value = '';
  target_url_input.value = '';
  match_type_select.value = 'exact';
  add_rule_btn.textContent = 'ルールを追加';
  add_rule_btn.classList.remove('btn-warning');
  add_rule_btn.classList.add('btn-primary');
  editing_index = null;
}

// ステータスメッセージを表示
function show_status(message, type = 'info') {
  status_message_div.textContent = message;
  status_message_div.className = `status-message ${type}`;
  status_message_div.style.display = 'block';

  setTimeout(() => {
    status_message_div.style.display = 'none';
  }, 3000);
}

// HTMLエスケープ
function escape_html(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// イベントリスナー
add_rule_btn.addEventListener('click', add_rule);

// Enterキーでルール追加
rule_name_input.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') add_rule();
});

source_url_input.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') add_rule();
});

target_url_input.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') add_rule();
});

// 初期化
load_rules();
