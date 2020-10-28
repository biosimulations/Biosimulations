import { Observable } from 'rxjs';


export interface ViewAlgorithm {
  id: string;
  heading: Observable<string>;
  name: Observable<string>;
  description: Observable<DescriptionFragment[]>;
  url: Observable<string>;
  frameworks: Observable<ViewFramework>[];
  formats: Observable<ViewFormat>[];
  parameters: Observable<ViewParameter[]>;
  citations: ViewCitation[];
}

export enum DescriptionFragmentType {
  text = 'text',
  href = 'href',
}

export interface DescriptionFragment {
  type: DescriptionFragmentType;
  value: string;
}

export interface ViewFramework {
  id: string;
  name: string;
  url: string;
}

export interface ViewFormat {
  id: string;
  name: string;
  url: string;
}

export interface ViewParameter {
  id: string;
  name: Observable<string>;
  type: string;
  value: boolean | number | string;
  range: string | null;
  kisaoId: string;
  kisaoUrl: string;
}

export interface ViewIdentifier {
  text: string;
  url: string | null;
}

export interface ViewCitation {
  url: string | null;
  text: string;
}

export interface ViewVersion {
  label: string;
  date: string;
  image: string;
  url?: string;
}

export interface ViewSimulator {
  id: string;
  version: string;
  name: string;
  description: string | null;
  image: string;
  url: string;
  licenseUrl: Observable<string>;
  licenseName: Observable<string>;
  authors: string | null;
  identifiers: ViewIdentifier[];
  citations: ViewCitation[];
  algorithms: ViewAlgorithm[];
  versions: Observable<ViewVersion[]>;
}
