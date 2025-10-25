import "./globals.css";

export const metadata = {
  title: "Paperline",
  icons: [
    {
      rel: "icon",
      url: "/happy.jpeg",
    },
  ],
  description:
    "made by Aqila Rayya Syifa X.8 - Ilustrator Afwa Cantika X.5 - Music Composer Cinta Elona G.N X.1 - Story Writter M.Fathin Halim X.3 - Programmer",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
