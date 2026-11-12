# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Two audiences, both confirmed:

- Founders and product teams at startups and digital companies who need a digital product designed and built.
- Established (mid-size and large) companies creating new digital products or digitizing existing operations.

Both arrive evaluating a studio partner: they want to see the range and quality of the work quickly, understand what Nexus Labs builds, and start a conversation.

## Product Purpose

The institutional website of NEXUS LABS, a digital product studio (pt-BR). It exists to show the studio's work, explain what it builds, and turn a visit into a project conversation. Success is a qualified visitor sending a project request through the contact form.

## Positioning

Confirmed core delivery: digital products (apps, web platforms, custom systems). The previous site also listed strategy & innovation, AI & data, and brand experiences; the user confirmed only digital products as the core offer, so the others are open decisions and should not be promoted as headline capabilities without confirmation.

## Operating Context

- Visitors arrive from referrals, LinkedIn/Instagram, and direct links; they skim on desktop and phone.
- Contact today is a form that composes an e-mail to ola@nexuslab.com.br. A WhatsApp path exists in code but stays hidden until the company has a number.
- Hosted on Vercel from the GitHub repo `nexus-labs-org/nexuslabswebpage`; React + Vite + TypeScript single page.

## Capabilities and Constraints

- Single page. Language: Brazilian Portuguese.
- Projects area must work with placeholder images now; the team will swap in real project images later, so project data must be easy to edit in one place.
- Social URLs (LinkedIn, Instagram), WhatsApp number, and final domain are not decided yet; hide what is missing rather than linking nowhere.
- The user asked for the structure and interaction feel of labs.griflan.com (an explorable grid of projects). Use it as a structural reference only; Griflan's branding, copy, mascot, and imagery must not be copied.

## Brand Commitments

- Name: NEXUS LABS. Logo assets in `public/assets/` (`nexus-labs-horizontal-light.svg`, `nexus-labs-horizontal-dark.svg`, `nexus-labs-symbol.svg`, `nexus-labs-symbol-dark.svg`, `favicon.svg`): the "N" keystone mark with a diamond.
- Official palette from the Keystone identity: Deep Slate #0F172A, Electric Cerulean #0096D6, Luminous Cyan #00E5FF, Crisp White #F8FAFC.
- Site palette and effects (user direction, 2026-11-10): follow the reference video of labs.griflan.com's header — near-black ground #181616, cream type #FFFDDB, red action #FF3831, hover colour sweeps (green, red, violet, cyan) on the logo, taglines and rules. The Keystone colours stay in the logo files; on the site the logo renders as a cream mask.
- Contact e-mail: ola@nexuslab.com.br (spelling to be confirmed by the user).

## Evidence on Hand

- No public case studies, client names, testimonials, or metrics yet. Do not fabricate them. The previous "+30 projetos lançados" figure is unconfirmed and must not be shown.
- Project imagery is placeholder until real work is supplied: 12 fictional products with screens and device mockups drawn for the site, looping demo videos (`*-6.webm`, small copies `*-6-sm.webm` for the grid), and context photos from Unsplash under the Unsplash License (free commercial use, attribution not required) in `public/projects/photos/`. Every project is labelled "exemplo ilustrativo"; never present them as client work.

## Product Principles

1. The work leads. The page is a showcase first; explanation supports it.
2. Say only what is true. No invented clients, numbers, or claims.
3. One clear next step: start a project conversation.
4. Built to be swapped. Placeholder content lives in data the team can replace without touching layout.
