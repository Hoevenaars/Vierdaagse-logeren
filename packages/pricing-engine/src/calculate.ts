import type { PriceCalculationInput, PriceLine, PriceResult } from './types.ts';

function roundCents(value: number): number {
  return Math.round(value * 100) / 100;
}

function addLine(
  breakdown: PriceLine[],
  line: PriceLine
): void {
  breakdown.push({ ...line, amount: roundCents(line.amount) });
}

export function calculateStayPrice(input: PriceCalculationInput): PriceResult {
  const warnings: string[] = [];
  const breakdown: PriceLine[] = [];
  const { rule, request } = input;

  if (!rule) {
    return {
      total: null,
      currency: 'EUR',
      complete: false,
      breakdown: [],
      warnings: ['Geen prijsregel voor dit verblijfstype en seizoen.'],
      estimated: false,
      deposit: null,
    };
  }

  if (rule.seasonYear !== request.seasonYear) {
    warnings.push(`Prijsregel geldt voor ${rule.seasonYear}, niet voor ${request.seasonYear}.`);
  }

  if (rule.minimumNights && request.nights < rule.minimumNights) {
    warnings.push(`Minimumverblijf is ${rule.minimumNights} nachten.`);
  }

  if (rule.pricingType === 'fixed_week' && (request.nights < 5 || request.nights > 7)) {
    warnings.push('Dit is een weekarrangement; het getoonde totaal geldt voor de Vierdaagseweek, niet per extra nacht.');
  }

  switch (rule.pricingType) {
    case 'fixed_week':
    case 'package': {
      if (rule.basePrice == null) {
        warnings.push('Basisprijs van het arrangement ontbreekt.');
        break;
      }
      addLine(breakdown, {
        code: rule.pricingType === 'package' ? 'package' : 'pitch',
        label: rule.pricingType === 'package' ? 'Arrangement' : 'Standplaats (week)',
        amount: rule.basePrice,
        optional: false,
      });
      if (rule.pricePerPerson != null && request.partySize > 0) {
        addLine(breakdown, {
          code: 'persons',
          label: `${request.partySize} ${request.partySize === 1 ? 'persoon' : 'personen'}`,
          amount: rule.pricePerPerson * request.partySize,
          optional: false,
        });
      }
      break;
    }
    case 'per_night': {
      const nightly = rule.pricePerNight ?? rule.basePrice;
      if (nightly == null) {
        warnings.push('Nachtprijs ontbreekt.');
        break;
      }
      addLine(breakdown, {
        code: 'nights',
        label: `Standplaats × ${request.nights} nachten`,
        amount: nightly * request.nights,
        optional: false,
      });
      if (rule.pricePerPerson != null) {
        addLine(breakdown, {
          code: 'persons',
          label: `${request.partySize} ${request.partySize === 1 ? 'persoon' : 'personen'} × ${request.nights} nachten`,
          amount: rule.pricePerPerson * request.partySize * request.nights,
          optional: false,
        });
      }
      break;
    }
    case 'per_pitch': {
      if (rule.basePrice == null) {
        warnings.push('Standplaatsprijs ontbreekt.');
        break;
      }
      addLine(breakdown, {
        code: 'pitch',
        label: 'Standplaats',
        amount: rule.basePrice,
        optional: false,
      });
      if (rule.pricePerNight != null) {
        addLine(breakdown, {
          code: 'nights',
          label: `Extra nachttarief × ${request.nights}`,
          amount: rule.pricePerNight * request.nights,
          optional: false,
        });
      }
      if (rule.pricePerPerson != null) {
        addLine(breakdown, {
          code: 'persons',
          label: `${request.partySize} ${request.partySize === 1 ? 'persoon' : 'personen'}`,
          amount: rule.pricePerPerson * request.partySize,
          optional: false,
        });
      }
      break;
    }
    case 'per_person': {
      if (rule.pricePerPerson == null) {
        warnings.push('Persoonsprijs ontbreekt.');
        break;
      }
      const nightsMultiplier = rule.pricePerNight != null ? request.nights : 1;
      addLine(breakdown, {
        code: 'persons',
        label:
          nightsMultiplier > 1
            ? `${request.partySize} ${request.partySize === 1 ? 'persoon' : 'personen'} × ${request.nights} nachten`
            : `${request.partySize} ${request.partySize === 1 ? 'persoon' : 'personen'}`,
        amount: rule.pricePerPerson * request.partySize * nightsMultiplier,
        optional: false,
      });
      if (rule.basePrice != null) {
        addLine(breakdown, {
          code: 'pitch',
          label: 'Standplaats',
          amount: rule.basePrice,
          optional: false,
        });
      }
      break;
    }
    default: {
      warnings.push('Onbekend prijsmodel; totaal wordt niet berekend.');
    }
  }

  const electricityResult = optionalExtra({
    requested: request.electricity,
    rulePrice: rule.electricityPrice,
    amenity: input.electricityAmenity,
    code: 'electricity',
    label: 'Stroom',
    missingMessage: 'Stroomprijs is onbekend.',
    unavailableMessage: 'Stroom is bij deze aanbieder niet beschikbaar.',
  });
  breakdown.push(...electricityResult.lines);
  warnings.push(...electricityResult.warnings);

  const parkingResult = optionalExtra({
    requested: request.parking,
    rulePrice: rule.parkingPrice,
    amenity: input.parkingAmenity,
    code: 'parking',
    label: 'Parkeren',
    missingMessage: 'Parkeerprijs is onbekend.',
    unavailableMessage: 'Parkeren is bij deze aanbieder niet beschikbaar.',
  });
  breakdown.push(...parkingResult.lines);
  warnings.push(...parkingResult.warnings);

  if (rule.touristTax != null) {
    addLine(breakdown, {
      code: 'tourist_tax',
      label: 'Toeristenbelasting',
      amount: rule.touristTax * request.partySize * request.nights,
      optional: false,
    });
  }

  for (const fee of rule.mandatoryFees) {
    addLine(breakdown, {
      code: 'mandatory',
      label: fee.label,
      amount: fee.amount,
      optional: false,
    });
  }

  const missingBase = breakdown.length === 0;
  const complete = !missingBase && warnings.length === 0;
  const knownSum = roundCents(breakdown.reduce((sum, line) => sum + line.amount, 0));

  return {
    total: complete ? knownSum : null,
    currency: 'EUR',
    complete,
    breakdown,
    warnings,
    estimated: false,
    deposit: rule.deposit,
  };
}

function optionalExtra(args: {
  requested: boolean;
  rulePrice: number | null;
  amenity?: { available: boolean; included: boolean; price: number | null } | null;
  code: Extract<PriceLine['code'], 'electricity' | 'parking'>;
  label: string;
  missingMessage: string;
  unavailableMessage: string;
}): { lines: PriceLine[]; warnings: string[] } {
  if (!args.requested) {
    return { lines: [], warnings: [] };
  }

  if (args.amenity && args.amenity.available === false) {
    return { lines: [], warnings: [args.unavailableMessage] };
  }

  if (args.amenity?.included) {
    return {
      lines: [
        {
          code: args.code,
          label: `${args.label} (inbegrepen)`,
          amount: 0,
          optional: true,
        },
      ],
      warnings: [],
    };
  }

  const amount = args.rulePrice ?? args.amenity?.price ?? null;
  if (amount == null) {
    return { lines: [], warnings: [args.missingMessage] };
  }

  return {
    lines: [
      {
        code: args.code,
        label: args.label,
        amount: roundCents(amount),
        optional: true,
      },
    ],
    warnings: [],
  };
}
