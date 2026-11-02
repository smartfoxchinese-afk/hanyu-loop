import Link from "next/link";

const features = [
  {
    icon: "🗺️",
    title: "Khám phá thế giới",
    text: "Đi qua Fox Village, rừng trúc và khu chợ. Mỗi vùng đất mở ra khi bạn thật sự dùng được tiếng Trung.",
  },
  {
    icon: "🧠",
    title: "Nhớ chữ Hán lâu hơn",
    text: "Hệ thống ôn tập ngắt quãng biết bạn đang quên chữ nào và nhắc đúng lúc — kèm âm Hán Việt.",
  },
  {
    icon: "💬",
    title: "Nói được, không chỉ biết",
    text: "Nhiệm vụ hội thoại buộc bạn dùng từ vừa học: mua trái cây, hỏi đường, giới thiệu bản thân.",
  },
  {
    icon: "🌱",
    title: "Khu vườn lớn lên cùng bạn",
    text: "Học xong nhận hạt giống, ôn đều thì cây ra hoa. Nghỉ vài ngày? Có nhiệm vụ quay lại nhẹ nhàng.",
  },
];

const words = [
  { hanzi: "你好", pinyin: "nǐ hǎo", hanviet: "Nhĩ hảo", vi: "xin chào" },
  { hanzi: "学习", pinyin: "xuéxí", hanviet: "Học tập", vi: "học tập" },
  { hanzi: "苹果", pinyin: "píngguǒ", hanviet: "Bình quả", vi: "quả táo" },
];

export default function Home() {
  return (
    <div className="page">
      <header className="nav">
        <a className="logo" href="#">
          <span className="logo-mark" aria-hidden="true">
            🦊
          </span>
          <span>
            HANYU <b>LOOP</b>
          </span>
        </a>
        <Link className="btn ghost small" href="/login">Đăng nhập</Link>
      </header>

      <main>
        <section className="hero">
          <div className="hero-text">
            <p className="eyebrow">学中文 · Học tiếng Trung</p>
            <h1>
              Learn Chinese.
              <br />
              <em>Live the Language.</em>
            </h1>
            <p className="lead">
              Một thế giới học tiếng Trung dành cho người Việt — nơi bạn khám phá, làm
              nhiệm vụ và dùng tiếng Trung thật, thay vì chỉ làm bài tập.
            </p>
            <div className="actions">
              <Link className="btn primary" href="/login">
                Bắt đầu phiêu lưu
              </Link>
              <a className="btn ghost" href="#features">
                Xem tính năng
              </a>
            </div>
          </div>

          <div className="hero-visual" aria-label="Cáo nhỏ Xiao Hu">
            <div className="orb" />
            <div className="fox-stage">
              <span className="fox" role="img" aria-label="Cáo">
                🦊
              </span>
              <span className="fox-shadow" />
            </div>
            <div className="float-card card-top">
              <span>小狐 Xiao Hu</span>
              <small>Bạn đồng hành của bạn</small>
            </div>
            <div className="float-card card-bottom">
              <span>你好！我叫小狐。</span>
              <small>Xin chào! Mình là Xiao Hu.</small>
            </div>
          </div>
        </section>

        <section className="village" aria-labelledby="village-title">
          <div className="village-head">
            <p className="eyebrow">Vùng đất đầu tiên · HSK 1</p>
            <h2 id="village-title">🏡 Fox Village</h2>
            <p>
              Chào hỏi, giới thiệu bản thân, những từ đầu tiên. Hoàn thành nhiệm vụ để mở
              lối sang Bamboo Forest.
            </p>
          </div>
          <ul className="word-list">
            {words.map((w) => (
              <li key={w.hanzi} className="word">
                <span className="hanzi" lang="zh">
                  {w.hanzi}
                </span>
                <span className="pinyin">{w.pinyin}</span>
                <span className="hanviet">{w.hanviet}</span>
                <span className="meaning">{w.vi}</span>
              </li>
            ))}
          </ul>
        </section>

        <section id="features" className="features" aria-label="Tính năng">
          {features.map((f) => (
            <article key={f.title} className="feature">
              <span className="feature-icon" aria-hidden="true">
                {f.icon}
              </span>
              <h3>{f.title}</h3>
              <p>{f.text}</p>
            </article>
          ))}
        </section>
      </main>

      <footer className="footer">
        <span>© 2026 HANYU LOOP</span>
        <span>Explore → Learn → Use → Reward → Grow</span>
      </footer>
    </div>
  );
}
