import { chromium } from 'playwright'

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })

await page.goto('https://wlbilab.org/portal/login', { waitUntil: 'load' })
await page.getByLabel(/email/i).fill('jkim183@mgh.harvard.edu')
await page.getByLabel(/password/i).fill('bilab123!')
await page.getByRole('button', { name: /sign in|log in/i }).click()
await page.waitForURL('**/portal', { timeout: 10000 })

const grants = [
  {
    name: 'NIH R03 Small Research Grant Program',
    funder: 'NIH (NCI/NINDS, parent announcement)',
    amount: 'up to $50,000/yr, 2 years',
    url: 'https://grants.nih.gov/funding/activity-codes/R03',
    notes: '[Fit] Small pilot/feasibility studies, secondary analysis of existing data, or short-term self-contained projects -- no clinical trials. [Eligibility] No career-stage restriction, appropriate for PI. [Action] Not every NIH institute participates -- confirm NCI/NINDS participation on the current parent announcement before applying.',
  },
  {
    name: 'DF/HCC Neuro-Oncology SPORE (Targeted Therapies for Glioma)',
    funder: 'Dana-Farber/Harvard Cancer Center (NCI-sponsored SPORE)',
    amount: '~$175,000/yr direct costs per project',
    url: 'https://www.dfhcc.harvard.edu/research/research-programs/clinical-based-programs/neuro-oncology/neuro-oncology-spore-scientific-rfa',
    notes: "[Fit] Directly relevant -- neuro-oncology/glioma-focused, and the lab already has a Dana-Farber affiliation (footer partner logo, glioma outcome calculators). [Eligibility] Internal scientific RFA process for DF/HCC-affiliated investigators, not a general open application. [Action] Track for the next scientific RFA cycle -- contact the Center for Neuro-Oncology (Dr. Patrick Wen's group) about the current cycle's timeline.",
  },
  {
    name: 'DF/HCC Cancer Center Development Funding (pilot project awards)',
    funder: 'Dana-Farber/Harvard Cancer Center',
    url: 'https://www.dfhcc.harvard.edu/insider/for-researchers/funding',
    notes: "[Fit] General cancer pilot funding open to DF/HCC-affiliated investigators -- the lab already qualifies via Dana-Farber affiliation. [Action] Couldn't find a specific current amount/deadline publicly -- check DF/HCC's funding page directly for the current cycle.",
  },
  {
    name: 'Harvard Catalyst: Early Clinical Data Support for Grants',
    funder: 'Harvard Catalyst (NCATS-funded CTSA hub)',
    amount: 'up to $30,000',
    url: 'https://catalyst.harvard.edu/pilot-funding/',
    notes: '[Fit] Not neuro-oncology-specific, but generally applicable -- funds preliminary clinical data to strengthen an upcoming NIH grant submission, similar function to the NASBS Career Development Award. [Action] Harvard Catalyst runs rotating RFA rounds; most other current rounds (sensory biology, health disparities) do not fit this lab -- check for new rounds periodically rather than assuming this one stays open.',
  },
]

for (const g of grants) {
  await page.goto('https://wlbilab.org/portal/grants', { waitUntil: 'load' })
  await page.locator('summary', { hasText: 'Add grant opportunity' }).click()
  await page.getByLabel('Name').fill(g.name)
  if (g.funder) await page.getByLabel('Funder').fill(g.funder)
  if (g.amount) await page.getByLabel('Amount').fill(g.amount)
  if (g.url) await page.getByLabel('Link').fill(g.url)
  if (g.notes) await page.getByLabel('Notes').fill(g.notes)
  await page.getByRole('button', { name: 'Add grant' }).click()
  await page.waitForTimeout(1500)
  await page.goto('https://wlbilab.org/portal/grants', { waitUntil: 'load' })
  const ok = await page.getByText(g.name).count() > 0
  console.log(ok ? 'OK' : 'FAIL', '-', g.name)
}

await page.getByRole('button', { name: 'Sign out' }).click()
await page.waitForTimeout(1000)
await browser.close()
