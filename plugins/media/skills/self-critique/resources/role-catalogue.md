# Role catalogue, extended

The SKILL.md tables carry the roles used most. This file carries the rest, and
the rule for choosing between them.

## Selection rule

A role earns its place when it can find something the other selected roles
cannot. Two roles that would raise the same finding are one role.

| Artefact | Minimum panel |
|---|---|
| Typo, copy change, comment | maintainer, end user |
| Internal function or helper | senior developer, QA engineer |
| Endpoint or service | backend architect, security engineer, QA engineer, operations engineer |
| Page or component | senior frontend engineer, accessibility specialist, mobile user, QA engineer |
| Schema change or migration | database engineer, backend architect, operations engineer, maintainer |
| Infrastructure or pipeline change | DevOps engineer, security engineer, operations engineer, maintainer |
| Architecture proposal | software architect, senior developer, security engineer, next owner, client |
| Technical document | technical writer, subject matter expert, new developer, information architect |
| User document | technical writer, end user, support agent, translator |
| Administrative document | professional editor, administrative reviewer, recipient, compliance oriented reviewer |
| Report | executive, subject matter expert, professional editor |
| Generated PDF | professional editor, print reviewer, accessibility specialist, recipient |
| Release | release engineer, QA engineer, operations engineer, security engineer, client |
| Handover | next owner, operations engineer, client |

## Additional roles

| Role | Asks | Use when |
|---|---|---|
| Support agent | what ticket does this generate | user facing changes, error messages |
| Translator | does this survive translation without ambiguity | documents with a non English audience |
| Print reviewer | what breaks when this is printed in black and white | any paginated deliverable |
| Data protection reviewer | what personal data is stored, logged or transmitted, and was that necessary | user data, logs, analytics, exports |
| Cost reviewer | what does this cost per month at current volume | infrastructure, third party services, storage |
| Legal reviewer | does this claim, promise or commit to something | client facing text, terms, marketing copy |
| Onboarding engineer | how long from clone to running | setup instructions, tooling changes |
| Incident responder | at 3am with this alert, what is my first command | logging, alerting, runbooks |

Legal and data protection roles identify risk and stop. Neither invents an
obligation, cites a statute, or gives a legal opinion. Both report to a human.

## Anti-patterns

| Anti-pattern | Why it fails |
|---|---|
| The full catalogue on a small change | dilutes the real finding under fifteen empty ones |
| One merged pass wearing every hat | produces the author's own opinion in a costume |
| Roles chosen after the findings | confirms what was already believed |
| A panel with no user facing role | ships something correct and unusable |
| A panel with only user facing roles | ships something pleasant that loses data |
| Findings without locations | cannot be verified, cannot be fixed, cannot be re-reviewed |

## Domain specific starting questions

Where a role feels abstract, start from the artefact instead.

```
What input has nobody tried?
What happens on the second call?
What happens when the network fails halfway?
What does the person see when it goes wrong?
What did the request ask for that is not here?
What is here that the request never mentioned?
Who maintains this, and what will they not understand?
```
