import createMDX from "@next/mdx";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig = {
  pageExtensions: ["js", "jsx", "mdx", "ts", "tsx"],
};

const withMDX = createMDX({
  extension: /\.mdx?$/,
});

const withNextIntl = createNextIntlPlugin();

export default withNextIntl(withMDX(nextConfig));