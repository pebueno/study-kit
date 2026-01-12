import { Header } from '@/components/Header';
import { TextEditor } from '@/components/TextEditor';
import { Footer } from '@/components/Footer';

const Index = () => {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <TextEditor />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
