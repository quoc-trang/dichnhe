import './global.css'

export const metadata = {
  title: "Dịch nhé · learn english",
  description: "Translate AI-generated Vietnamese sentences into English and get instant feedback.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
