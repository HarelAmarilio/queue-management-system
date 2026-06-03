import aboutPhoto from "../../images/yarin-photo.png";

function AboutSection() {
  return (
    <section id="about-us" className="about-section">
      <h2>קצת עליי</h2>
      <img src={aboutPhoto} alt="ירין - מעצבת גבות Nini Eyebrows" />
      <p>אחרי הרבה זמן ועבודה קשה - הבייבי החדש שלי כאן🤍🪬</p>
      <p>
        אני מקבלת לקוחות באופן רשמי🫶🏻 וכל אחת מוזמנת לקבוע תור לעיצוב גבות מדויק,
        מחמיא ומותאם אישית✨
      </p>
    </section>
  );
}

export default AboutSection;
