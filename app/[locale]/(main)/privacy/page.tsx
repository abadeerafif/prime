import { privacy } from "@/content/legal";
import { legalPage } from "@/components/templates/LegalPage";

const { generateMetadata, Page } = legalPage(privacy);

export { generateMetadata };
export default Page;
