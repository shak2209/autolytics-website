# Generated from autolytics-website-test-cases.csv by scripts/generate-features.ts. Do not edit; edit the CSV instead.
@admin-sign-in
Feature: Admin sign-in

  @TC-AUTH-001 @regression @admin @auth-credentials @REQ-AUTH-01 @priority-high
  Scenario Outline: TC-AUTH-001: Staff can sign in with valid credentials
    # Priority: High | Type: Functional | Page: Admin: Sign in | Requirement: REQ-AUTH-01
    Given I open the admin sign-in page
    When I sign in as the "<role>" with the correct password
    Then I should be on the "Manage services" admin page
    And the session banner should show the "<role>" account with the "<label>" role

    Examples:
      | role | label |
      | editor | Editor |
      | viewer | Viewer |

  @TC-AUTH-002 @regression @admin @negative @auth-credentials @REQ-AUTH-02 @priority-high
  Scenario Outline: TC-AUTH-002: A wrong username or password gets the same generic error
    # Priority: High | Type: Negative / Security | Page: Admin: Sign in | Requirement: REQ-AUTH-02
    Given I open the admin sign-in page
    When I sign in with username "<username>" and password "<password>"
    Then I should see the sign-in error "Invalid username or password."
    And I should be on the "Sign in" admin page

    Examples:
      | username | password |
      | {editor} | wrong-password-1 |
      | {viewer} | wrong-password-1 |
      | nobody | wrong-password-1 |

  @TC-AUTH-003 @regression @admin @negative @REQ-AUTH-02 @priority-medium
  Scenario Outline: TC-AUTH-003: Empty sign-in fields are rejected
    # Priority: Medium | Type: Negative / Validation | Page: Admin: Sign in | Requirement: REQ-AUTH-02
    Given I open the admin sign-in page
    When I sign in with username "<username>" and password "<password>"
    Then I should see the sign-in error "Enter your username and password."
    And I should be on the "Sign in" admin page

    Examples:
      | username | password |
      |  |  |
      | someone |  |
      |  | some-password |

  @TC-AUTH-004 @regression @admin @negative @auth-credentials @REQ-AUTH-02 @priority-high
  Scenario: TC-AUTH-004: Sign-in is locked after 3 failed attempts, even with the correct password
    # Priority: High | Type: Negative / Security | Page: Admin: Sign in | Requirement: REQ-AUTH-02
    Given I open the admin sign-in page
    When I fail to sign in 3 times
    Then I should see the sign-in error "Too many failed attempts. Try again in 1 minute."
    When I sign in as the "editor" with the correct password
    Then I should see the sign-in error "Too many failed attempts. Try again in 1 minute."
    And I should be on the "Sign in" admin page

  @TC-AUTH-005 @regression @admin @auth-credentials @REQ-AUTH-02 @priority-medium
  Scenario: TC-AUTH-005: The lock-out ends after one minute
    # Priority: Medium | Type: Functional | Page: Admin: Sign in | Requirement: REQ-AUTH-02
    Given the browser clock is controlled
    And I open the admin sign-in page
    When I fail to sign in 3 times
    And 61 seconds pass
    And I sign in as the "editor" with the correct password
    Then I should be on the "Manage services" admin page

  @TC-AUTH-006 @regression @admin @REQ-AUTH-01 @priority-low
  Scenario: TC-AUTH-006: The password can be shown and hidden
    # Priority: Low | Type: Usability | Page: Admin: Sign in | Requirement: REQ-AUTH-01
    Given I open the admin sign-in page
    When I type "Example-123" in the password field
    Then the password characters should be hidden
    When I click the "Show password" button
    Then the password characters should be visible
    And the "Hide password" button should be visible
    When I click the "Hide password" button
    Then the password characters should be hidden

  @TC-AUTH-007 @regression @admin @REQ-AUTH-03 @priority-high
  Scenario: TC-AUTH-007: Signing out ends the session
    # Priority: High | Type: Functional / Security | Page: Admin: Sign in | Requirement: REQ-AUTH-03
    Given I am signed in as the "Editor"
    When I click the "Sign out" button
    Then I should be on the "Sign in" admin page
    And I should see the sign-in notice "You have been signed out."
    When I open the admin page "Manage services"
    Then I should be on the "Sign in" admin page
    And I should see the sign-in notice "Please sign in to continue."

  @TC-AUTH-008 @regression @admin @negative @REQ-AUTH-03 @priority-high
  Scenario: TC-AUTH-008: The back button does not reveal admin data after signing out
    # Priority: High | Type: Security | Page: Admin: Sign in | Requirement: REQ-AUTH-03
    Given I am signed in as the "Editor"
    And I open a second tab on the admin page "Manage services"
    When I open the "Services" page
    And I sign out in the second tab
    And I go back in the browser
    Then I should be on the "Sign in" admin page
    And the services table should not be visible

  @TC-AUTH-009 @regression @admin @REQ-AUTH-03 @priority-high
  Scenario: TC-AUTH-009: The session expires after 15 minutes of inactivity
    # Priority: High | Type: Functional / Security | Page: Admin: Sign in | Requirement: REQ-AUTH-03
    Given the browser clock is controlled
    And I am signed in as the "Editor"
    When 16 minutes pass
    And I click the "Add service" button
    Then I should be on the "Sign in" admin page
    And I should see the sign-in notice "Your session has expired. Please sign in again."

  @TC-AUTH-010 @regression @admin @REQ-AUTH-03 @priority-medium
  Scenario: TC-AUTH-010: Activity keeps the session alive
    # Priority: Medium | Type: Functional | Page: Admin: Sign in | Requirement: REQ-AUTH-03
    Given the browser clock is controlled
    And I am signed in as the "Editor"
    When 10 minutes pass
    And I click the "Add service" button
    And 10 minutes pass
    And I click the "Cancel" button
    Then I should be on the "Manage services" admin page
    And the service form should be closed

  @TC-AUTH-011 @regression @admin @REQ-AUTH-03 @priority-medium
  Scenario: TC-AUTH-011: Signing out in one tab signs out the other tab
    # Priority: Medium | Type: Functional / Security | Page: Admin: Sign in | Requirement: REQ-AUTH-03
    Given I am signed in as the "Editor"
    And I open a second tab on the admin page "Manage services"
    When I sign out in the second tab
    Then the first tab should be on the "Sign in" admin page
