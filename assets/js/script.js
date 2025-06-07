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
    let startY = 0; // タッチ開始時のY座標を追加
    let currentTranslate = 0; // 現在のスライドラッパーのtranslateX値
    let isDragging = false; // ドラッグ中かどうかのフラグ
    let isDirectionDetermined = false; // スワイプの方向が決定されたかどうかのフラグ
    let isHorizontalSwipe = false; // 水平スワイプとして認識されたかどうかのフラグ

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
        startY = e.touches[0].clientY; // タッチ開始時のY座標を記録
        isDirectionDetermined = false; // 方向決定フラグをリセット
        isHorizontalSwipe = false; // 水平スワイプフラグをリセット
        swiperWrapper.style.transition = 'none'; // ドラッグ中はトランジションを無効化
    });

    // タッチ移動時
    swiperContainer.addEventListener('touchmove', (e) => {
        if (!isDragging) return; // ドラッグ中でなければ何もしない

        const currentX = e.touches[0].clientX; // 現在のX座標
        const currentY = e.touches[0].clientY; // 現在のY座標
        const diffX = currentX - startX; // X方向の移動量
        const diffY = currentY - startY; // Y方向の移動量

        // スワイプの方向がまだ決定されていない場合
        if (!isDirectionDetermined) {
            const absDiffX = Math.abs(diffX); // X方向の絶対移動量
            const absDiffY = Math.abs(diffY); // Y方向の絶対移動量

            // 方向を判断するための閾値 (例: 10ピクセル)
            const directionThreshold = 10;

            if (absDiffX > directionThreshold || absDiffY > directionThreshold) {
                // どちらかの方向に十分に動いたら方向を決定
                if (absDiffX > absDiffY) {
                    // X方向への動きが大きい場合、水平スワイプと判断
                    isHorizontalSwipe = true;
                } else {
                    // Y方向への動きが大きい場合、垂直スクロールと判断
                    isHorizontalSwipe = false;
                }
                isDirectionDetermined = true; // 方向を決定済みとする
            }
        }

        // 水平スワイプと判断された場合のみ、デフォルトのスクロール動作を阻止し、水平移動を処理
        if (isHorizontalSwipe) {
            e.preventDefault(); // ページの垂直スクロールを阻止
            swiperWrapper.style.transform = `translateX(${currentTranslate + diffX}px)`;
        }
        // 垂直スクロールと判断された場合は、何もしない（ブラウザのデフォルトスクロールを許可する）
    }, { passive: false }); // `passive: false` を追加して `e.preventDefault()` を有効にする

    // タッチ終了時
    swiperContainer.addEventListener('touchend', (e) => {
        if (!isDragging) return; // ドラッグ中でなければ何もしない
        isDragging = false; // ドラッグ終了
        // ドラッグ終了後にトランジションを有効化
        swiperWrapper.style.transition = 'transform 0.3s ease-in-out';

        // 水平スワイプと判断された場合のみ、スライド変更のロジックを実行
        if (isHorizontalSwipe) {
            const endX = e.changedTouches[0].clientX; // タッチ終了時のX座標
            const diffX = endX - startX; // 最終的なX方向の移動量
            // スワイプと認識する距離（コンテナ幅の1/4）
            const threshold = swiperContainer.offsetWidth / 4;

            if (diffX > threshold && currentIndex > 0) {
                moveToSlide(currentIndex - 1); // 右に大きくスワイプした場合、前のスライドへ
            } else if (diffX < -threshold && currentIndex < totalSlides - 1) {
                moveToSlide(currentIndex + 1); // 左に大きくスワイプした場合、次のスライドへ
            } else {
                moveToSlide(currentIndex); // スワイプが不十分だった場合、現在のスライドに戻る
            }
        }
        // 次のタッチ操作のためにフラグをリセット
        isDirectionDetermined = false;
        isHorizontalSwipe = false;
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
