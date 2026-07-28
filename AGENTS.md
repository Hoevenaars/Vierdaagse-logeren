---
import GebiedTemplate from '../../../layouts/GebiedTemplate.astro';

export function getStaticPaths() {
  const gebiedenModules = import.meta.glob('../../../data/gebieden/*.json', { eager: true });
  return Object.values(gebiedenModules).map((mod: any) => ({
    params: { slug: mod.default.slug },
    props: { data: mod.default },
  }));
}

const { data } = Astro.props;
---

<GebiedTemplate data={data} locale="en" />
