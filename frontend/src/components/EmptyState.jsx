function EmptyState({ title, description, language = 'en' }) {
  const direction = language === 'ar' ? 'rtl' : 'ltr'

  return (
    <div className="empty-state" lang={language} dir={direction}>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  )
}

export default EmptyState