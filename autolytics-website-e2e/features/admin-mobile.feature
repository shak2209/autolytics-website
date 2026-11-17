# Generated from autolytics-website-test-cases.csv by scripts/generate-features.ts. Do not edit; edit the CSV instead.
@admin-mobile
Feature: Admin area on mobile

  @TC-MOB-007 @regression @admin @mobile @REQ-A11Y-02 @priority-medium
  Scenario Outline: TC-MOB-007: Admin pages fit a phone screen without sideways scrolling
    # Priority: Medium | Type: Responsive | Page: Admin | Requirement: REQ-A11Y-02
    Given my browser window is 375 by 812 pixels
    And the admin page is in the "<state>" state
    Then the page should not scroll sideways

    Examples:
      | state |
      | sign-in |
      | services list |
      | service form open |
