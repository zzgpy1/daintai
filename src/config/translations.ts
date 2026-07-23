export type SupportedLanguage = 'zh' | 'en' | 'es' | 'fr' | 'de' | 'ja' | 'ko' | 'ru' | 'ar' | 'pt' | 'it' | 'hi' | 'th' | 'vi'

export const translations: Record<SupportedLanguage, any> = {
  zh: {
    nav: { home: '首页', search: '搜索', history: '足迹', favorites: '收藏', settings: '设置', language: '语言' },
    home: { title: '全球电台', subtitle: '聆听世界，音乐无界', randomDiscover: '随机发现', exploreNew: '探索新电台', findFavorites: '找到喜欢的', musicStations: '音乐电台', latestStations: '最新电台', refresh: '刷新', loadMore: '加载更多', noStations: '暂无电台' },
    search: { title: '搜索电台', placeholder: '搜索电台名称、国家或标签...', filters: '筛选条件', country: '国家', language: '语言', tags: '标签', allCountries: '所有国家', allLanguages: '所有语言', allTags: '所有标签', searchButton: '搜索', reset: '重置', results: '搜索结果', noResults: '未找到相关电台', stations: '个电台' },
    favorites: { title: '我的收藏', empty: '暂无收藏电台', emptyHint: '发现喜欢的电台，点击爱心收藏吧', clearAll: '清空收藏', cancel: '取消', clear: '清空' },
    history: { title: '足迹', empty: '暂无访问记录', emptyHint: '开始聆听电台，这里会记录您的足迹', clearAll: '清空足迹', today: '今天', yesterday: '昨天' },
    settings: { title: '设置', appSettings: '应用设置', themeMode: '主题模式', switchTheme: '切换应用的外观主题', audioSettings: '音频设置', volume: '音量', mute: '静音', max: '最大', aboutApp: '关于应用', version: '版本', deviceType: '设备类型', desktop: '桌面端', tablet: '平板端', mobile: '移动端', unknown: '未知' },
    player: { play: '播放', pause: '暂停', stop: '停止', volume: '音量', mute: '静音', unmute: '取消静音', favorite: '收藏', unfavorite: '取消收藏', favorited: '已收藏', addToFavorite: '添加收藏', close: '关闭', loading: '加载中...', error: '播放错误', retry: '重试' },
    common: { loading: '加载中...', error: '出错了', retry: '重试', cancel: '取消', confirm: '确认', save: '保存', delete: '删除', close: '关闭', back: '返回', unknown: '未知' }
  },
  en: {
    nav: { home: 'Home', search: 'Search', history: 'History', favorites: 'Favorites', settings: 'Settings', language: 'Language' },
    home: { title: 'Global Radio', subtitle: 'Listen to the world, music without borders', randomDiscover: 'Random Discover', exploreNew: 'Explore New Stations', findFavorites: 'Find Your Favorites', musicStations: 'Music Stations', latestStations: 'Latest Stations', refresh: 'Refresh', loadMore: 'Load More', noStations: 'No stations' },
    search: { title: 'Search Stations', placeholder: 'Search station name, country or tags...', filters: 'Filters', country: 'Country', language: 'Language', tags: 'Tags', allCountries: 'All Countries', allLanguages: 'All Languages', allTags: 'All Tags', searchButton: 'Search', reset: 'Reset', results: 'Search Results', noResults: 'No stations found', stations: ' stations' },
    favorites: { title: 'My Favorites', empty: 'No favorite stations', emptyHint: 'Discover stations you like and favorite them', clearAll: 'Clear All', cancel: 'Cancel', clear: 'Clear' },
    history: { title: 'History', empty: 'No listening history', emptyHint: 'Start listening to stations, your history will be recorded here', clearAll: 'Clear History', today: 'Today', yesterday: 'Yesterday' },
    settings: { title: 'Settings', appSettings: 'App Settings', themeMode: 'Theme Mode', switchTheme: 'Switch app appearance theme', audioSettings: 'Audio Settings', volume: 'Volume', mute: 'Mute', max: 'Max', aboutApp: 'About App', version: 'Version', deviceType: 'Device Type', desktop: 'Desktop', tablet: 'Tablet', mobile: 'Mobile', unknown: 'Unknown' },
    player: { play: 'Play', pause: 'Pause', stop: 'Stop', volume: 'Volume', mute: 'Mute', unmute: 'Unmute', favorite: 'Favorite', unfavorite: 'Unfavorite', favorited: 'Favorited', addToFavorite: 'Add to Favorite', close: 'Close', loading: 'Loading...', error: 'Playback failed', retry: 'Retry' },
    common: { loading: 'Loading...', error: 'Error occurred', retry: 'Retry', cancel: 'Cancel', confirm: 'Confirm', save: 'Save', delete: 'Delete', close: 'Close', back: 'Back', unknown: 'Unknown' }
  },
  es: {
    nav: { home: 'Inicio', search: 'Buscar', history: 'Historial', favorites: 'Favoritos', settings: 'Configuración', language: 'Idioma' },
    home: { title: 'Radio Global', subtitle: 'Escucha el mundo, música sin fronteras', randomDiscover: 'Descubrir al azar', exploreNew: 'Explorar nuevas radios', findFavorites: 'Encuentra tus favoritas', musicStations: 'Radios de música', latestStations: 'Últimas radios', refresh: 'Actualizar', loadMore: 'Cargar más', noStations: 'Sin estaciones' },
    search: { title: 'Buscar estaciones', placeholder: 'Buscar nombre, país o etiquetas...', filters: 'Filtros', country: 'País', language: 'Idioma', tags: 'Etiquetas', allCountries: 'Todos los países', allLanguages: 'Todos los idiomas', allTags: 'Todas las etiquetas', searchButton: 'Buscar', reset: 'Restablecer', results: 'Resultados', noResults: 'No se encontraron estaciones', stations: ' estaciones' },
    favorites: { title: 'Mis favoritos', empty: 'Sin estaciones favoritas', emptyHint: 'Descubre estaciones que te gusten', clearAll: 'Limpiar todo', cancel: 'Cancelar', clear: 'Limpiar' },
    history: { title: 'Historial', empty: 'Sin historial', emptyHint: 'Comienza a escuchar estaciones', clearAll: 'Limpiar historial', today: 'Hoy', yesterday: 'Ayer' },
    settings: { title: 'Configuración', appSettings: 'Configuración de la app', themeMode: 'Modo de tema', switchTheme: 'Cambiar tema', audioSettings: 'Configuración de audio', volume: 'Volumen', mute: 'Silenciar', max: 'Máximo', aboutApp: 'Acerca de la app', version: 'Versión', deviceType: 'Tipo de dispositivo', desktop: 'Escritorio', tablet: 'Tableta', mobile: 'Móvil', unknown: 'Desconocido' },
    player: { play: 'Reproducir', pause: 'Pausar', stop: 'Detener', volume: 'Volumen', mute: 'Silenciar', unmute: 'Activar sonido', favorite: 'Favorito', unfavorite: 'Quitar favorito', favorited: 'Añadido a favoritos', addToFavorite: 'Añadir a favoritos', close: 'Cerrar', loading: 'Cargando...', error: 'Error de reproducción', retry: 'Reintentar' },
    common: { loading: 'Cargando...', error: 'Ocurrió un error', retry: 'Reintentar', cancel: 'Cancelar', confirm: 'Confirmar', save: 'Guardar', delete: 'Eliminar', close: 'Cerrar', back: 'Atrás', unknown: 'Desconocido' }
  },
  fr: {
    nav: { home: 'Accueil', search: 'Rechercher', history: 'Historique', favorites: 'Favoris', settings: 'Paramètres', language: 'Langue' },
    home: { title: 'Radio Mondiale', subtitle: 'Écoutez le monde, musique sans frontières', randomDiscover: 'Découverte aléatoire', exploreNew: 'Explorer de nouvelles radios', findFavorites: 'Trouvez vos favoris', musicStations: 'Radios musicales', latestStations: 'Dernières radios', refresh: 'Actualiser', loadMore: 'Charger plus', noStations: 'Aucune radio' },
    search: { title: 'Rechercher des radios', placeholder: 'Rechercher un nom, pays ou tags...', filters: 'Filtres', country: 'Pays', language: 'Langue', tags: 'Tags', allCountries: 'Tous les pays', allLanguages: 'Toutes les langues', allTags: 'Tous les tags', searchButton: 'Rechercher', reset: 'Réinitialiser', results: 'Résultats', noResults: 'Aucune radio trouvée', stations: ' radios' },
    favorites: { title: 'Mes favoris', empty: 'Aucune radio favorite', emptyHint: 'Découvrez des radios que vous aimez', clearAll: 'Tout effacer', cancel: 'Annuler', clear: 'Effacer' },
    history: { title: 'Historique', empty: 'Aucun historique', emptyHint: 'Commencez à écouter des radios', clearAll: 'Effacer l\'historique', today: 'Aujourd\'hui', yesterday: 'Hier' },
    settings: { title: 'Paramètres', appSettings: 'Paramètres de l\'app', themeMode: 'Mode thème', switchTheme: 'Changer le thème', audioSettings: 'Paramètres audio', volume: 'Volume', mute: 'Muet', max: 'Maximum', aboutApp: 'À propos', version: 'Version', deviceType: 'Type d\'appareil', desktop: 'Bureau', tablet: 'Tablette', mobile: 'Mobile', unknown: 'Inconnu' },
    player: { play: 'Jouer', pause: 'Pause', stop: 'Arrêter', volume: 'Volume', mute: 'Muet', unmute: 'Activer le son', favorite: 'Favori', unfavorite: 'Retirer des favoris', favorited: 'Ajouté aux favoris', addToFavorite: 'Ajouter aux favoris', close: 'Fermer', loading: 'Chargement...', error: 'Erreur de lecture', retry: 'Réessayer' },
    common: { loading: 'Chargement...', error: 'Une erreur s\'est produite', retry: 'Réessayer', cancel: 'Annuler', confirm: 'Confirmer', save: 'Sauvegarder', delete: 'Supprimer', close: 'Fermer', back: 'Retour', unknown: 'Inconnu' }
  },
  de: {
    nav: { home: 'Startseite', search: 'Suchen', history: 'Verlauf', favorites: 'Favoriten', settings: 'Einstellungen', language: 'Sprache' },
    home: { title: 'Globales Radio', subtitle: 'Höre die Welt, Musik ohne Grenzen', randomDiscover: 'Zufällige Entdeckung', exploreNew: 'Neue Sender entdecken', findFavorites: 'Finde deine Favoriten', musicStations: 'Musik-Sender', latestStations: 'Neueste Sender', refresh: 'Aktualisieren', loadMore: 'Mehr laden', noStations: 'Keine Sender' },
    search: { title: 'Sender suchen', placeholder: 'Sendername, Land oder Tags suchen...', filters: 'Filter', country: 'Land', language: 'Sprache', tags: 'Tags', allCountries: 'Alle Länder', allLanguages: 'Alle Sprachen', allTags: 'Alle Tags', searchButton: 'Suchen', reset: 'Zurücksetzen', results: 'Suchergebnisse', noResults: 'Keine Sender gefunden', stations: ' Sender' },
    favorites: { title: 'Meine Favoriten', empty: 'Keine Lieblingssender', emptyHint: 'Entdecke Sender, die dir gefallen', clearAll: 'Alle löschen', cancel: 'Abbrechen', clear: 'Löschen' },
    history: { title: 'Verlauf', empty: 'Kein Hörverlauf', emptyHint: 'Beginne mit dem Hören von Sendern', clearAll: 'Verlauf löschen', today: 'Heute', yesterday: 'Gestern' },
    settings: { title: 'Einstellungen', appSettings: 'App-Einstellungen', themeMode: 'Themen-Modus', switchTheme: 'App-Erscheinung wechseln', audioSettings: 'Audio-Einstellungen', volume: 'Lautstärke', mute: 'Stumm', max: 'Maximum', aboutApp: 'Über die App', version: 'Version', deviceType: 'Gerätetyp', desktop: 'Desktop', tablet: 'Tablet', mobile: 'Mobil', unknown: 'Unbekannt' },
    player: { play: 'Abspielen', pause: 'Pause', stop: 'Stopp', volume: 'Lautstärke', mute: 'Stumm', unmute: 'Ton an', favorite: 'Favorit', unfavorite: 'Nicht Favorit', favorited: 'Zu Favoriten hinzugefügt', addToFavorite: 'Zu Favoriten hinzufügen', close: 'Schließen', loading: 'Lädt...', error: 'Wiedergabe fehlgeschlagen', retry: 'Wiederholen' },
    common: { loading: 'Lädt...', error: 'Ein Fehler ist aufgetreten', retry: 'Wiederholen', cancel: 'Abbrechen', confirm: 'Bestätigen', save: 'Speichern', delete: 'Löschen', close: 'Schließen', back: 'Zurück', unknown: 'Unbekannt' }
  },
  ja: {
    nav: { home: 'ホーム', search: '検索', history: '履歴', favorites: 'お気に入り', settings: '設定', language: '言語' },
    home: { title: 'グローバルラジオ', subtitle: '世界を聴こう、音楽に国境はない', randomDiscover: 'ランダム発見', exploreNew: '新しいラジオを探索', findFavorites: 'お気に入りを見つける', musicStations: '音楽ラジオ', latestStations: '最新のラジオ', refresh: '更新', loadMore: 'もっと読み込む', noStations: 'ラジオなし' },
    search: { title: 'ラジオを検索', placeholder: 'ラジオ名、国、タグを検索...', filters: 'フィルター', country: '国', language: '言語', tags: 'タグ', allCountries: 'すべての国', allLanguages: 'すべての言語', allTags: 'すべてのタグ', searchButton: '検索', reset: 'リセット', results: '検索結果', noResults: '関連するラジオが見つかりません', stations: 'ラジオ' },
    favorites: { title: 'マイお気に入り', empty: 'お気に入りラジオなし', emptyHint: '好きなラジオを見つけて保存', clearAll: 'クリア', cancel: 'キャンセル', clear: 'クリア' },
    history: { title: '履歴', empty: '履歴なし', emptyHint: 'ラジオを聴き始めると記録されます', clearAll: '履歴をクリア', today: '今日', yesterday: '昨日' },
    settings: { title: '設定', appSettings: 'アプリ設定', themeMode: 'テーマモード', switchTheme: 'テーマを切り替え', audioSettings: 'オーディオ設定', volume: '音量', mute: 'ミュート', max: '最大', aboutApp: 'アプリについて', version: 'バージョン', deviceType: 'デバイスタイプ', desktop: 'デスクトップ', tablet: 'タブレット', mobile: 'モバイル', unknown: '不明' },
    player: { play: '再生', pause: '一時停止', stop: '停止', volume: '音量', mute: 'ミュート', unmute: 'ミュート解除', favorite: 'お気に入り', unfavorite: '解除', favorited: '追加済み', addToFavorite: '追加', close: '閉じる', loading: '読み込み中...', error: '再生エラー', retry: '再試行' },
    common: { loading: '読み込み中...', error: 'エラーが発生しました', retry: '再試行', cancel: 'キャンセル', confirm: '確認', save: '保存', delete: '削除', close: '閉じる', back: '戻る', unknown: '不明' }
  },
  ko: {
    nav: { home: '홈', search: '검색', history: '기록', favorites: '즐겨찾기', settings: '설정', language: '언어' },
    home: { title: '글로벌 라디오', subtitle: '세계를 들어요, 음악에는 국경이 없어요', randomDiscover: '랜덤 발견', exploreNew: '새로운 라디오 탐색', findFavorites: '즐겨찾기 찾기', musicStations: '음악 라디오', latestStations: '최신 라디오', refresh: '새로고침', loadMore: '더 불러오기', noStations: '라디오 없음' },
    search: { title: '라디오 검색', placeholder: '라디오 이름, 국가 또는 태그 검색...', filters: '필터', country: '국가', language: '언어', tags: '태그', allCountries: '모든 국가', allLanguages: '모든 언어', allTags: '모든 태그', searchButton: '검색', reset: '재설정', results: '검색 결과', noResults: '관련 라디오를 찾을 수 없습니다', stations: '개 라디오' },
    favorites: { title: '내 즐겨찾기', empty: '즐겨찾기 라디오 없음', emptyHint: '좋아하는 라디오를 발견하고 저장', clearAll: '모두 지우기', cancel: '취소', clear: '지우기' },
    history: { title: '기록', empty: '기록 없음', emptyHint: '라디오를 듣기 시작하면 기록됩니다', clearAll: '기록 지우기', today: '오늘', yesterday: '어제' },
    settings: { title: '설정', appSettings: '앱 설정', themeMode: '테마 모드', switchTheme: '테마 전환', audioSettings: '오디오 설정', volume: '볼륨', mute: '음소거', max: '최대', aboutApp: '앱 정보', version: '버전', deviceType: '기기 유형', desktop: '데스크톱', tablet: '태블릿', mobile: '모바일', unknown: '알 수 없음' },
    player: { play: '재생', pause: '일시정지', stop: '정지', volume: '볼륨', mute: '음소거', unmute: '음소거 해제', favorite: '즐겨찾기', unfavorite: '해제', favorited: '추가됨', addToFavorite: '추가', close: '닫기', loading: '로딩 중...', error: '재생 오류', retry: '다시 시도' },
    common: { loading: '로딩 중...', error: '오류가 발생했습니다', retry: '다시 시도', cancel: '취소', confirm: '확인', save: '저장', delete: '삭제', close: '닫기', back: '뒤로', unknown: '알 수 없음' }
  },
  ru: {
    nav: { home: 'Главная', search: 'Поиск', history: 'История', favorites: 'Избранное', settings: 'Настройки', language: 'Язык' },
    home: { title: 'Глобальное радио', subtitle: 'Слушайте мир, музыка без границ', randomDiscover: 'Случайное открытие', exploreNew: 'Исследовать новые радио', findFavorites: 'Найти избранные', musicStations: 'Музыкальные радио', latestStations: 'Последние радио', refresh: 'Обновить', loadMore: 'Загрузить еще', noStations: 'Нет радио' },
    search: { title: 'Поиск радио', placeholder: 'Поиск названия, страны или тегов...', filters: 'Фильтры', country: 'Страна', language: 'Язык', tags: 'Теги', allCountries: 'Все страны', allLanguages: 'Все языки', allTags: 'Все теги', searchButton: 'Поиск', reset: 'Сброс', results: 'Результаты', noResults: 'Радио не найдены', stations: ' радио' },
    favorites: { title: 'Мое избранное', empty: 'Нет избранных радио', emptyHint: 'Найдите понравившиеся радио', clearAll: 'Очистить все', cancel: 'Отмена', clear: 'Очистить' },
    history: { title: 'История', empty: 'Нет записей', emptyHint: 'Начните слушать радио', clearAll: 'Очистить историю', today: 'Сегодня', yesterday: 'Вчера' },
    settings: { title: 'Настройки', appSettings: 'Настройки приложения', themeMode: 'Режим темы', switchTheme: 'Сменить тему', audioSettings: 'Настройки аудио', volume: 'Громкость', mute: 'Без звука', max: 'Максимум', aboutApp: 'О приложении', version: 'Версия', deviceType: 'Тип устройства', desktop: 'Компьютер', tablet: 'Планшет', mobile: 'Телефон', unknown: 'Неизвестно' },
    player: { play: 'Воспроизвести', pause: 'Пауза', stop: 'Стоп', volume: 'Громкость', mute: 'Без звука', unmute: 'Включить звук', favorite: 'Избранное', unfavorite: 'Убрать', favorited: 'Добавлено', addToFavorite: 'В избранное', close: 'Закрыть', loading: 'Загрузка...', error: 'Ошибка воспроизведения', retry: 'Повторить' },
    common: { loading: 'Загрузка...', error: 'Произошла ошибка', retry: 'Повторить', cancel: 'Отмена', confirm: 'Подтвердить', save: 'Сохранить', delete: 'Удалить', close: 'Закрыть', back: 'Назад', unknown: 'Неизвестно' }
  }
}
