# Generated from autolytics-website-test-cases.csv by scripts/generate-features.ts. Do not edit; edit the CSV instead.
@experience-tabs
Feature: Experience role tabs

  @TC-EXP-001 @smoke @regression @priority-high
  Scenario: TC-EXP-001: The most recent role is shown by default
    # Priority: High | Type: Functional | Page: Experience
    Given I open the "Experience" page
    Then there should be 8 role tabs
    And the "Answer Digital: NHS Genomics" tab for the "Test Manager" role should be selected
    And the panel for "Answer Digital: NHS Genomics" as "Test Manager" should be displayed
    And only one role panel should be visible
    And the URL should not contain a hash

  @TC-EXP-002 @smoke @regression @priority-high
  Scenario Outline: TC-EXP-002: Selecting a role tab shows that role's details
    # Priority: High | Type: Functional | Page: Experience
    Given I open the "Experience" page
    When I select the "<company>" tab for the "<role>" role
    Then the "<company>" tab for the "<role>" role should be selected
    And the panel for "<company>" as "<role>" should be displayed
    And the panel should show the dates "<dates>"
    And only one role panel should be visible
    And the URL hash should be "#<slug>"

    Examples:
      | company | role | dates | slug |
      | Answer Digital: NHS Genomics | Test Manager | January 2025 to present | answer-digital |
      | Next PLC | Test Delivery Lead | September 2023 to September 2024 | next-2023 |
      | Arrow Global | UAT Test Lead | July 2022 to June 2023 | arrow-global |
      | BIDX1 | Test Manager | January 2022 to July 2022 | bidx1 |
      | Evri | Test Lead | March 2020 to January 2022 | evri |
      | Next PLC | QA Senior Test Analyst | April 2019 to March 2020 | next-2019 |
      | Computershare Loan Services | Test Analyst | October 2017 to April 2019 | computershare |
      | Provident Financial Group | Test Analyst | March 2013 to October 2017 | provident |

  @TC-EXP-003 @regression @priority-high
  Scenario Outline: TC-EXP-003: A role can be opened directly from a link
    # Priority: High | Type: Navigation | Page: Experience
    Given I open the path "experience.html#<slug>"
    Then the "<company>" tab for the "<role>" role should be selected
    And the panel for "<company>" as "<role>" should be displayed
    And only one role panel should be visible

    Examples:
      | slug | company | role |
      | answer-digital | Answer Digital: NHS Genomics | Test Manager |
      | next-2023 | Next PLC | Test Delivery Lead |
      | arrow-global | Arrow Global | UAT Test Lead |
      | bidx1 | BIDX1 | Test Manager |
      | evri | Evri | Test Lead |
      | next-2019 | Next PLC | QA Senior Test Analyst |
      | computershare | Computershare Loan Services | Test Analyst |
      | provident | Provident Financial Group | Test Analyst |

  @TC-EXP-004 @regression @negative @priority-medium
  Scenario: TC-EXP-004: An unknown role link falls back to the most recent role
    # Priority: Medium | Type: Negative | Page: Experience
    Given I open the path "experience.html#does-not-exist"
    Then the "Answer Digital: NHS Genomics" tab for the "Test Manager" role should be selected
    And only one role panel should be visible

  @TC-EXP-005 @regression @keyboard @priority-high
  Scenario Outline: TC-EXP-005: Arrow keys move between role tabs
    # Priority: High | Type: Keyboard / Accessibility | Page: Experience
    Given I open the path "experience.html#<start slug>"
    When I press "<key>" on the selected tab
    Then the "<company>" tab for the "<role>" role should be selected
    And the "<company>" tab for the "<role>" role should have keyboard focus
    And the panel for "<company>" as "<role>" should be displayed

    Examples:
      | start slug | key | company | role |
      | answer-digital | ArrowDown | Next PLC | Test Delivery Lead |
      | answer-digital | ArrowRight | Next PLC | Test Delivery Lead |
      | next-2023 | ArrowUp | Answer Digital: NHS Genomics | Test Manager |
      | next-2023 | ArrowLeft | Answer Digital: NHS Genomics | Test Manager |

  @TC-EXP-006 @regression @keyboard @priority-medium
  Scenario Outline: TC-EXP-006: Arrow keys wrap around at the ends of the tab list
    # Priority: Medium | Type: Keyboard / Accessibility | Page: Experience
    Given I open the path "experience.html#<start slug>"
    When I press "<key>" on the selected tab
    Then the "<company>" tab for the "<role>" role should be selected
    And the panel for "<company>" as "<role>" should be displayed

    Examples:
      | start slug | key | company | role |
      | answer-digital | ArrowUp | Provident Financial Group | Test Analyst |
      | provident | ArrowDown | Answer Digital: NHS Genomics | Test Manager |

  @TC-EXP-007 @regression @keyboard @priority-medium
  Scenario: TC-EXP-007: Only the selected tab is in the keyboard tab order
    # Priority: Medium | Type: Keyboard / Accessibility | Page: Experience
    Given I open the path "experience.html#evri"
    Then only the selected role tab should be reachable with the Tab key
