import type { NextPage } from 'next';
import Button from '../src/components/ui/Button';
import Badge from '../src/components/ui/Badge';
import Card, { CardContent, CardHeader, CardSubtitle, CardTitle } from '../src/components/ui/Card';
import SectionHeader from '../src/components/ui/SectionHeader';

const UIDemoPage: NextPage = () => {
  return (
    <div className="min-h-screen bg-slate-50">
      <main className="mx-auto max-w-4xl px-4 py-10 space-y-10">
        <SectionHeader
          eyebrow="UI Kit"
          title="Nichapp design tokens & components"
          description="Preview of buttons, badges, cards, and section headers using the Nichapp theme."
        />

        <Card>
          <CardHeader>
            <CardTitle>Buttons</CardTitle>
            <CardSubtitle>Variants and sizes</CardSubtitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="ghost">Ghost</Button>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button size="sm">Small</Button>
              <Button size="md">Medium</Button>
              <Button size="lg">Large</Button>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button disabled>Disabled</Button>
              <Button variant="secondary" disabled>
                Disabled secondary
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Badges</CardTitle>
            <CardSubtitle>Use for statuses or tags</CardSubtitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Badge>Default</Badge>
            <Badge variant="outline">Outline</Badge>
            <Badge variant="success">Success</Badge>
            <Badge variant="warning">Warning</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Section header</CardTitle>
            <CardSubtitle>Reusable pattern for page sections</CardSubtitle>
          </CardHeader>
          <CardContent>
            <SectionHeader
              eyebrow="Discover"
              title="Latest stories"
              description="See what founders are sharing across Africa and the UK."
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Card layout</CardTitle>
            <CardSubtitle>Composable card pieces</CardSubtitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-slate-700">
              Cards use rounded corners, subtle borders, and soft shadows to match the Nichapp visual language.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <Card className="shadow-none ring-1 ring-slate-100">
                <CardTitle>Nested card</CardTitle>
                <CardSubtitle>Use Card inside grids</CardSubtitle>
                <p className="mt-2 text-sm text-slate-700">Great for stats, profiles, or story snippets.</p>
              </Card>
              <Card className="shadow-none ring-1 ring-slate-100">
                <CardTitle>Another card</CardTitle>
                <CardSubtitle>Keep spacing consistent</CardSubtitle>
                <p className="mt-2 text-sm text-slate-700">Mix with SectionHeader to introduce content.</p>
              </Card>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default UIDemoPage;
