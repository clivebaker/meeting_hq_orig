require "test_helper"

class MasterSlideTemplatesControllerTest < ActionDispatch::IntegrationTest
  setup do
    @master_slide_template = master_slide_templates(:one)
  end

  test "should get index" do
    get master_slide_templates_url
    assert_response :success
  end

  test "should get new" do
    get new_master_slide_template_url
    assert_response :success
  end

  test "should create master_slide_template" do
    assert_difference("MasterSlideTemplate.count") do
      post master_slide_templates_url, params: { master_slide_template: { content: @master_slide_template.content, enabled: @master_slide_template.enabled, name: @master_slide_template.name } }
    end

    assert_redirected_to master_slide_template_url(MasterSlideTemplate.last)
  end

  test "should show master_slide_template" do
    get master_slide_template_url(@master_slide_template)
    assert_response :success
  end

  test "should get edit" do
    get edit_master_slide_template_url(@master_slide_template)
    assert_response :success
  end

  test "should update master_slide_template" do
    patch master_slide_template_url(@master_slide_template), params: { master_slide_template: { content: @master_slide_template.content, enabled: @master_slide_template.enabled, name: @master_slide_template.name } }
    assert_redirected_to master_slide_template_url(@master_slide_template)
  end

  test "should destroy master_slide_template" do
    assert_difference("MasterSlideTemplate.count", -1) do
      delete master_slide_template_url(@master_slide_template)
    end

    assert_redirected_to master_slide_templates_url
  end
end
