/**
 * 各スワイパーコンテナを初期化する関数
 * @param {string} containerId - スワイパーコンテナのID
 */
function initializeSwiper(containerId) {
    const swiperContainer = document.getElementById(containerId);
    // 指定されたIDのコンテナが見つからない場合はエラーをコンソールに出力して終了
    if (!swiperContainer) {
        console.error(`Swiper container with ID "${containerId}" not found.`);
        return;
    }

    const swiperWrapper = swiperContainer.querySelector('.swiper-wrapper'); // スライド全体を囲むラッパー
    const swiperSlides = swiperContainer.querySelectorAll('.swiper-slide'); // 個々のスライド
    const paginationContainer = swiperContainer.querySelector('.swiper-pagination'); // ページネーションドットのコンテナ
    const totalSlides = swiperSlides.length; // スライドの総数

    let currentIndex = 0; // 現在表示されているスライドのインデックス
    let startX = 0; // タッチ開始時のX座標
    let currentTranslate = 0; // 現在のスライドラッパーのtranslateX値
    let isDragging = false; // ドラッグ中かどうかのフラグ

    /**
     * ページネーションドットを生成する関数
     */
    function createPaginationDots() {
        paginationContainer.innerHTML = ''; // 既存のドットをクリア
        for (let i = 0; i < totalSlides; i++) {
            const dot = document.createElement('span'); // ドット要素を作成
            dot.classList.add('dot'); // CSSクラスを追加
            if (i === currentIndex) {
                dot.classList.add('active'); // 現在のスライドに対応するドットをアクティブにする
            }
            // ドットがクリックされたらそのスライドへ移動
            dot.addEventListener('click', () => {
                moveToSlide(i);
            });
            paginationContainer.appendChild(dot); // ドットをコンテナに追加
        }
    }

    /**
     * 指定されたインデックスのスライドへ移動する関数
     * @param {number} index - 移動したいスライドのインデックス
     */
    function moveToSlide(index) {
        // インデックスが範囲外にならないように調整
        if (index < 0) index = 0;
        if (index >= totalSlides) index = totalSlides - 1;

        currentIndex = index; // 現在のインデックスを更新
        // スライドの幅に基づいてtranslateX値を計算
        currentTranslate = -currentIndex * swiperContainer.offsetWidth;
        // ラッパー要素のtransformプロパティを更新してスライドを移動
        swiperWrapper.style.transform = `translateX(${currentTranslate}px)`;
        updatePaginationDots(); // ページネーションドットの状態を更新
    }

    /**
     * ページネーションドットのアクティブ状態を更新する関数
     */
    function updatePaginationDots() {
        const dots = paginationContainer.querySelectorAll('.dot'); // 全てのドット要素を取得
        dots.forEach((dot, index) => {
            // 現在のスライドに対応するドットのみに'active'クラスをトグル
            dot.classList.toggle('active', index === currentIndex);
        });
    }

    // --- イベントリスナーの追加 ---

    // タッチ開始時
    swiperContainer.addEventListener('touchstart', (e) => {
        isDragging = true; // ドラッグ開始
        startX = e.touches[0].clientX; // タッチ開始時のX座標を記録
        swiperWrapper.style.transition = 'none'; // ドラッグ中はトランジションを無効化
    });

    // タッチ移動時
    swiperContainer.addEventListener('touchmove', (e) => {
        if (!isDragging) return; // ドラッグ中でなければ何もしない
        const currentX = e.touches[0].clientX; // 現在のX座標
        const diffX = currentX - startX; // 移動量
        // ドラッグ中の位置をリアルタイムで更新
        swiperWrapper.style.transform = `translateX(${currentTranslate + diffX}px)`;
    });

    // タッチ終了時
    swiperContainer.addEventListener('touchend', (e) => {
        if (!isDragging) return; // ドラッグ中でなければ何もしない
        isDragging = false; // ドラッグ終了
        // ドラッグ終了後にトランジションを有効化
        swiperWrapper.style.transition = 'transform 0.3s ease-in-out';

        const endX = e.changedTouches[0].clientX; // タッチ終了時のX座標
        const diffX = endX - startX; // 最終的な移動量
        // スワイプと認識する距離（コンテナ幅の1/4）
        const threshold = swiperContainer.offsetWidth / 4;

        if (diffX > threshold && currentIndex > 0) {
            moveToSlide(currentIndex - 1); // 右に大きくスワイプした場合、前のスライドへ
        } else if (diffX < -threshold && currentIndex < totalSlides - 1) {
            moveToSlide(currentIndex + 1); // 左に大きくスワイプした場合、次のスライドへ
        } else {
            moveToSlide(currentIndex); // スワイプが不十分だった場合、現在のスライドに戻る
        }
    });

    // ウィンドウのリサイズ時
    window.addEventListener('resize', () => {
        // リサイズ時にスライド位置を再計算して調整
        moveToSlide(currentIndex);
    });

    // --- 初期表示時の処理 ---
    createPaginationDots(); // ページネーションドットを生成
    moveToSlide(0); // 最初のスライドを表示
}

// ページが完全に読み込まれた後に各スワイパーを初期化
document.addEventListener('DOMContentLoaded', () => {
    initializeSwiper('feeding-swiper'); // 「餌のあげ方」スワイパーを初期化
    initializeSwiper('alone-swiper');   // 「お留守番」スワイパーを初期化
    initializeSwiper('eyemask-swiper'); // 「ホットアイマスク」スワイパーを初期化
});
