require "test_helper"

class SlideTemplatesControllerTest < ActionDispatch::IntegrationTest
  setup do
    @slide_template = slide_templates(:one)
  end

  test "should get index" do
    get slide_templates_url
    assert_response :success
  end

  test "should get new" do
    get new_slide_template_url
    assert_response :success
  end

  test "should create slide_template" do
    assert_difference("SlideTemplate.count") do
      post slide_templates_url, params: { slide_template: { content: @slide_template.content, enabled: @slide_template.enabled, name: @slide_template.name, organisation_id: @slide_template.organisation_id } }
    end

    assert_redirected_to slide_template_url(SlideTemplate.last)
  end

  test "should show slide_template" do
    get slide_template_url(@slide_template)
    assert_response :success
  end

  test "should get edit" do
    get edit_slide_template_url(@slide_template)
    assert_response :success
  end

  test "should update slide_template" do
    patch slide_template_url(@slide_template), params: { slide_template: { content: @slide_template.content, enabled: @slide_template.enabled, name: @slide_template.name, organisation_id: @slide_template.organisation_id } }
    assert_redirected_to slide_template_url(@slide_template)
  end

  test "should destroy slide_template" do
    assert_difference("SlideTemplate.count", -1) do
      delete slide_template_url(@slide_template)
    end

    assert_redirected_to slide_templates_url
  end
end
