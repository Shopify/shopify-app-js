import { TitleBar } from "@shopify/app-bridge-react";

export default function AdditionalPage() {
  return (
    <s-page>
      <TitleBar title="Additional page"></TitleBar>
      <s-section heading="Multiple pages">
        <s-paragraph>
          The app template comes with an additional page which demonstrates how
          to create multiple pages within app navigation using{" "}
          <s-link
            href="https:shopify.dev/docs/apps/tools/app-bridge"
            target="_blank"
          >
            App Bridge
          </s-link>
        </s-paragraph>
      </s-section>
    </s-page>
  );
}