export default function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="app-shell__footer">
      <small>PWA Factory Skeleton v3.0 • © {year}</small>
    </footer>
  )
}

