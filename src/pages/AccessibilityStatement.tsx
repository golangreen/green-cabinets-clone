import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/layout/Header";

export default function AccessibilityStatement() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main id="main-content" className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>Accessibility Statement</CardTitle>
            <CardDescription>
              Our commitment to making Green Cabinets accessible to everyone
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <section>
              <h2 className="text-2xl font-semibold mb-4">Our Commitment</h2>
              <p className="text-muted-foreground">
                Green Cabinets is committed to ensuring digital accessibility for people with disabilities.
                We are continually improving the user experience for everyone and applying the relevant
                accessibility standards.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Conformance Status</h2>
              <p className="text-muted-foreground mb-2">
                The Web Content Accessibility Guidelines (WCAG) defines requirements for designers and
                developers to improve accessibility for people with disabilities. It defines three levels
                of conformance: Level A, Level AA, and Level AAA.
              </p>
              <p className="text-muted-foreground">
                Green Cabinets is partially conformant with WCAG 2.1 level AA. Partially conformant means
                that some parts of the content do not fully conform to the accessibility standard.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Feedback</h2>
              <p className="text-muted-foreground mb-2">
                We welcome your feedback on the accessibility of Green Cabinets. Please let us know if
                you encounter accessibility barriers:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>Email: greencabinetsny@gmail.com</li>
                <li>Phone: (516) 208-6473</li>
              </ul>
              <p className="text-muted-foreground mt-4">
                We try to respond to feedback within 5 business days.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Technical Specifications</h2>
              <p className="text-muted-foreground">
                Accessibility of Green Cabinets relies on the following technologies to work with the
                particular combination of web browser and any assistive technologies or plugins installed
                on your computer:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4 mt-2">
                <li>HTML</li>
                <li>CSS</li>
                <li>JavaScript</li>
                <li>ARIA (Accessible Rich Internet Applications)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Limitations and Alternatives</h2>
              <p className="text-muted-foreground mb-2">
                Despite our best efforts to ensure accessibility, there may be some limitations. Below
                is a description of known limitations and potential solutions:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>
                  <strong>3D Preview:</strong> The vanity designer's 3D preview may not be fully
                  accessible to screen reader users. We provide alternative text descriptions and
                  measurement displays.
                </li>
                <li>
                  <strong>Image Gallery:</strong> Some decorative images may not have alternative text.
                  We are working to add descriptions to all meaningful images.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Assessment Approach</h2>
              <p className="text-muted-foreground">
                Green Cabinets assessed the accessibility of this website by the following approaches:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4 mt-2">
                <li>Self-evaluation using automated testing tools (pa11y, axe-core)</li>
                <li>Manual testing with keyboard navigation</li>
                <li>Screen reader testing</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Date</h2>
              <p className="text-muted-foreground">
                This statement was created on <time dateTime="2024-01-18">January 18, 2024</time> and
                last reviewed on <time dateTime="2024-01-18">January 18, 2024</time>.
              </p>
            </section>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
