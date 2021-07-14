import { Injectable } from '@angular/core';

import { Author } from '../../shared/views/author';
import { Taxon } from '../../shared/views/taxon';
import { Format } from '../../shared/views/format';
import { Owner } from '../../shared/views/owner';
import { IOntologyTerm } from '@biosimulations/datamodel/common';
import { LicenseModel } from '../../shared/views/license';
import { BiomodelVariable } from '../../shared/views/biomodelVariable';
import { BiomodelParameter } from '../../shared/views/biomodelParameter';

export interface Model {
  id: string;
  name: string;
  tags: string[];
  description: string;
  summary: string;
  imageUrl: string;

  framework: IOntologyTerm;
  format: Format;
  authors: Author[];
  owner: Owner;
  created: Date;
  updated: Date;
  taxon: Taxon | null;
  license: LicenseModel;
  variables: BiomodelVariable[];
  parameters: BiomodelParameter[];
}
@Injectable({
  providedIn: 'root',
})
export class BrowseModelsService {
  constructor() {}
  public getModels() {
    return [
      {
        location: '.',
        title: 'Name',
        abstract: 'Short summary',
        keywords: ['tag 1', 'tag 2'],
        thumbnails: ['./thumbnail.png'],
        description: 'Description',
        taxa: [
          {
            uri: 'https://identifiers.org/taxonomy/9606',
            label: 'Homo sapiens',
          },
        ],
        encodes: [
          {
            uri: 'https://identifiers.org/CL:0001057',
            label: 'myeloid dendritic cell, human',
          },
        ],
        sources: [
          {
            uri: 'https://github.org/lab/project',
            label: 'Tsur 2019 model source code',
          },
        ],
        predecessors: [
          {
            uri: 'https://identifiers.org/biomodels.db:BIOMD0000000837',
            label:
              'Hanson2016 - Toxicity Management in CAR T cell therapy for B-ALL',
          },
        ],
        successors: [
          {
            uri: 'https://identifiers.org/biomodels.db:BIOMD0000000839',
            label: 'Almeida2019 - Transcription-based circadian ...',
          },
        ],
        see_also: [
          {
            uri: 'https://identifiers.org/biomodels.db:BIOMD0000000836',
            label: 'Radosavljevic2009_BioterroristAttack_PanicProtection_1',
          },
        ],
        identifiers: [
          {
            uri: 'https://identifiers.org/biomodels.db:BIOMD0000000838',
            label: 'biomodels.db:BIOMD0000000838',
          },
        ],
        citations: [
          {
            uri: 'https://identifiers.org/doi:10.1016/j.copbio.2017.12.013',
            label:
              'Goldberg AP, Szigeti B, Chew YH, Sekar JA, Roth YD & Karr JR. Emerging whole-cell modeling principles and methods. Curr Opin Biotechnol 2018, 51:97-102',
          },
          {
            uri: 'https://identifiers.org/pubmed:29275251',
            label:
              'Goldberg AP, Szigeti B, Chew YH, Sekar JA, Roth YD & Karr JR. Emerging whole-cell modeling principles and methods. Curr Opin Biotechnol 2018, 51:97-102',
          },
        ],
        creators: [
          {
            uri: 'https://identifiers.org/orcid:0000-0001-8254-4958',
            label: 'Jonathan Karr',
          },
        ],
        contributors: [
          {
            uri: null,
            label: 'Name of person with no ORCID account',
          },
        ],
        license: {
          uri: 'https://identifiers.org/spdx:MIT',
          label: 'MIT',
        },
        funders: [
          {
            uri: 'https://identifiers.org/doi:10.13039/100000001',
            label: 'National Science Foundation',
          },
        ],
        created: '2020-06-18',
        modified: ['2021-06-18'],
        other: [
          {
            attribute_uri:
              'http://ontology.eil.utoronto.ca/icity/OM/temporalUnit',
            attribute_label: 'Temporal unit',
            uri: 'http://www.w3.org/2006/time#second',
            label: 'second',
          },
        ],
      },
      {
        location: './sim.sedml/figure1',
        title: null,
        abstract: null,
        keywords: [],
        thumbnails: [],
        description: null,
        taxa: [],
        encodes: [],
        sources: [],
        predecessors: [],
        successors: [],
        see_also: [],
        identifiers: [
          {
            uri: 'https://doi.org/10.1371/journal.pcbi.1008379.g001',
            label: 'Figure 1a',
          },
        ],
        citations: [],
        creators: [],
        contributors: [],
        license: null,
        funders: [],
        created: null,
        modified: [],
        other: [],
      },
    ];
  }
}
