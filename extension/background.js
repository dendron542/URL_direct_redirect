// リダイレクトルールを更新する関数
async function update_redirect_rules() {
  try {
    // ストレージからルールを取得
    const data = await chrome.storage.local.get('rules');
    const rules = data.rules || [];

    // 既存のルールをすべて削除
    const existing_rules = await chrome.declarativeNetRequest.getDynamicRules();
    const rule_ids_to_remove = existing_rules.map(rule => rule.id);

    // 新しいルールを作成
    const new_rules = [];
    let rule_id = 1;

    for (const rule of rules) {
      if (!rule.enabled) continue;

      let url_filter;
      let regex_filter;

      // 一致方法に応じてフィルターを設定
      if (rule.matchType === 'exact') {
        url_filter = rule.sourceUrl;
      } else if (rule.matchType === 'partial') {
        url_filter = `*${rule.sourceUrl}*`;
      } else if (rule.matchType === 'regex') {
        regex_filter = rule.sourceUrl;
      }

      const redirect_rule = {
        id: rule_id++,
        priority: 1,
        action: {
          type: 'redirect',
          redirect: { url: rule.targetUrl }
        },
        condition: {}
      };

      if (url_filter) {
        redirect_rule.condition.urlFilter = url_filter;
      } else if (regex_filter) {
        redirect_rule.condition.regexFilter = regex_filter;
      }

      redirect_rule.condition.resourceTypes = [
        'main_frame',
        'sub_frame',
        'stylesheet',
        'script',
        'image',
        'font',
        'object',
        'xmlhttprequest',
        'ping',
        'csp_report',
        'media',
        'websocket',
        'other'
      ];

      new_rules.push(redirect_rule);
    }

    // ルールを更新
    await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: rule_ids_to_remove,
      addRules: new_rules
    });

    console.log('Redirect rules updated:', new_rules);
  } catch (error) {
    console.error('Error updating redirect rules:', error);
  }
}

// 拡張機能インストール時の初期化
chrome.runtime.onInstalled.addListener(async () => {
  console.log('URL Redirect extension installed');
  await update_redirect_rules();
});

// ストレージの変更を監視
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && changes.rules) {
    console.log('Rules changed, updating...');
    update_redirect_rules();
  }
});

// メッセージリスナー（options.jsからのルール更新要求を処理）
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'updateRules') {
    update_redirect_rules().then(() => {
      sendResponse({ success: true });
    }).catch((error) => {
      sendResponse({ success: false, error: error.message });
    });
    return true; // 非同期レスポンスのため
  }
});

// 拡張機能アイコンクリック時に設定画面を新しいタブで開く
chrome.action.onClicked.addListener(() => {
  chrome.runtime.openOptionsPage();
});
