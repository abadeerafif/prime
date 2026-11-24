import { terms } from "@/content/legal";
import { legalPage } from "@/components/templates/LegalPage";

const { generateMetadata, Page } = legalPage(terms);

export { generateMetadata };
export default Page;
