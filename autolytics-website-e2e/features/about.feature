# Generated from autolytics-website-test-cases.csv by scripts/generate-features.ts. Do not edit; edit the CSV instead.
@about
Feature: About Me page

  @TC-ABOUT-001 @regression @priority-medium
  Scenario: TC-ABOUT-001: Certifications are listed
    # Priority: Medium | Type: Content | Page: About Me
    Given I open the "About Me" page
    Then the list under the "Certifications" heading should be:
      | iSQI Certified Agile Tester (2018) |
      | ISTQB Software Testing Foundation (2013) |
      | ITIL Foundation V3 (2013) |
      | Service Desk SDI Foundation (2012) |

  @TC-ABOUT-002 @regression @priority-low
  Scenario: TC-ABOUT-002: Education details are shown
    # Priority: Low | Type: Content | Page: About Me
    Given I open the "About Me" page
    Then I should see the text "BSc (Hons) Computing, 2:1"
    And I should see the text "Sheffield Hallam University, 2007"

  @TC-ABOUT-003 @regression @priority-low
  Scenario: TC-ABOUT-003: Tools and technologies are listed
    # Priority: Low | Type: Content | Page: About Me
    Given I open the "About Me" page
    Then there should be 25 tags under the "Tools & technologies" heading
    And the tags under the "Tools & technologies" heading should include:
      | Playwright |
      | Selenium WebDriver |
      | Postman |
      | Azure DevOps |
      | Jira |

  @TC-ABOUT-004 @regression @priority-medium
  Scenario: TC-ABOUT-004: The "View my experience" button opens the Experience page
    # Priority: Medium | Type: Navigation | Page: About Me; Experience
    Given I open the "About Me" page
    When I click the "View my experience" link
    Then I should be on the "Experience" page
