import "./globals.css";


export const metadata = {
  title: "Project Strawberry 33",
  description: "made by Aqila Raya Syifa X.(aku lupa) - Ilustrator Afwa Cantika X.5 - Music Composer Cinta Elona G.N X.1 - Story Writter M.Fathin Halim X.3 - Programmer",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
      >
        {children}
      </body>
    </html>
  );
}
