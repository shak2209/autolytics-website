# Generated from autolytics-website-test-cases.csv by scripts/generate-features.ts. Do not edit; edit the CSV instead.
@admin-accessibility
Feature: Admin accessibility

  @TC-A11Y-003 @regression @admin @a11y @REQ-A11Y-02 @priority-high
  Scenario Outline: TC-A11Y-003: Admin pages have no serious or critical accessibility violations
    # Priority: High | Type: Accessibility | Page: Admin | Requirement: REQ-A11Y-02
    Given the admin page is in the "<state>" state
    Then the page should have no serious or critical accessibility violations

    Examples:
      | state |
      | sign-in |
      | sign-in with an error |
      | services list |
      | service form open |
      | service form with errors |

  @TC-A11Y-004 @regression @admin @a11y @keyboard @auth-credentials @REQ-A11Y-02 @REQ-AUTH-01 @priority-high
  Scenario: TC-A11Y-004: Staff can sign in using only the keyboard
    # Priority: High | Type: Keyboard / Accessibility | Page: Admin: Sign in | Requirement: REQ-A11Y-02, REQ-AUTH-01
    Given I open the admin sign-in page
    When I sign in using only the keyboard as the "editor"
    Then I should be on the "Manage services" admin page
