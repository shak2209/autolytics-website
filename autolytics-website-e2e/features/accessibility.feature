# Generated from autolytics-website-test-cases.csv by scripts/generate-features.ts. Do not edit; edit the CSV instead.
@accessibility
Feature: Accessibility and page metadata

  @TC-A11Y-001 @regression @a11y @priority-high
  Scenario Outline: TC-A11Y-001: Pages have no serious or critical accessibility violations
    # Priority: High | Type: Accessibility | Page: All pages
    Given I open the "<page>" page
    Then the page should have no serious or critical accessibility violations

    Examples:
      | page |
      | Home |
      | About Me |
      | Services |
      | Experience |

  @TC-A11Y-002 @regression @seo @priority-medium
  Scenario Outline: TC-A11Y-002: Pages declare their language, a description and one main heading
    # Priority: Medium | Type: Accessibility / SEO | Page: All pages
    Given I open the "<page>" page
    Then the page language should be "en-GB"
    And the page should have a meta description
    And the page should have exactly one main heading

    Examples:
      | page |
      | Home |
      | About Me |
      | Services |
      | Experience |
