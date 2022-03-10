class SlideTemplatesController < ApplicationController
  before_action :set_organisation
  before_action :set_slide_template, only: %i[ show edit update destroy ]

  skip_before_action :verify_authenticity_token, only: :update_component


  # GET /slide_templates or /slide_templates.json
  def index
    @slide_templates = @organisation.slide_templates
    @master_slide_templates = MasterSlideTemplate.all
  end

  # GET /slide_templates/1 or /slide_templates/1.json
  def show


    @components = Component.all
    @update_path = organisation_business_unit_update_component_path(@organisation, @business_unit)
  end

  # GET /slide_templates/new
  def new
    @slide_template = SlideTemplate.new
    @slide_template.organisation_id = @organisation.id
  end

  # GET /slide_templates/1/edit
  def edit
  end


  def add_component
    @slide_template = SlideTemplate.find(params[:slide_template_id])
    @component = Component.find(params[:component_id])
    SlideTemplateComponent.create(
      component_id: @component.id,
      slide_template_id: @slide_template.id
    )
   redirect_to organisation_business_unit_slide_template_path(@organisation, @business_unit, @slide_template)
  end

  def update_component
    @slide_template_component = SlideTemplateComponent.find(params[:master_slide_template_component_id])
    @slide_template_component.name = params[:name]
    @slide_template_component.top = params[:top] if params[:top].present?
    @slide_template_component.left = params[:left] if params[:left].present?
    if params[:height].present?
      height = params[:height].to_i < 600 ? params[:height].to_i : 800
      @slide_template_component.height = params[:height]
    end
    if params[:width].present?
      width = params[:width].to_i < 800 ? params[:width].to_i : 800
      @slide_template_component.width = width
    end
    
    @slide_template_component.save
    respond_to do |format|
      format.html { redirect_to organisation_business_unit_slide_template_path(@organisation, @business_unit, @slide_template_component.slide_template) }
      format.json { render json: @slide_template_component.to_json}
    end
  end


  def add_master
    @master_slide_template = MasterSlideTemplate.find(params[:master_slide_template_id])
    @master_slide_template_components = @master_slide_template.master_slide_template_components
    
    @slide_template = SlideTemplate.create(organisation_id: @organisation.id, name: @master_slide_template.name, enabled: true)

    binding.pry

    @master_slide_template_components.each do |master_slide_template_component|


    @slide_template_component = SlideTemplateComponent.create(
      slide_template_id: @slide_template.id, 
      component_id: master_slide_template_component.component_id,
      name: master_slide_template_component.name,
      top: master_slide_template_component.top,
      left: master_slide_template_component.left,
      height: master_slide_template_component.height,
      width: master_slide_template_component.width
    )

    end

    respond_to do |format|
      format.html { redirect_to organisation_slide_templates_path(@organisation), notice: "Master Slide template was copied." }
    end

  end

  # POST /slide_templates or /slide_templates.json
  def create
    @slide_template = SlideTemplate.new(slide_template_params)

    respond_to do |format|
      if @slide_template.save
        format.html { redirect_to organisation_business_unit_slide_template_url(@organisation, @business_unit, @slide_template), notice: "Slide template was successfully created." }
        format.json { render :show, status: :created, location: @slide_template }
      else
        format.html { render :new, status: :unprocessable_entity }
        format.json { render json: @slide_template.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /slide_templates/1 or /slide_templates/1.json
  def update
    respond_to do |format|
      if @slide_template.update(slide_template_params)
        format.html { redirect_to  organisation_business_unit_slide_template_url(@organisation, @business_unit, @slide_template), notice: "Slide template was successfully updated." }
        format.json { render :show, status: :ok, location: @slide_template }
      else
        format.html { render :edit, status: :unprocessable_entity }
        format.json { render json: @slide_template.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /slide_templates/1 or /slide_templates/1.json
  def destroy
    @slide_template.destroy

    respond_to do |format|
      format.html { redirect_to organisation_business_unit_slide_templates_url(@organisation, @business_unit), notice: "Slide template was successfully destroyed." }
      format.json { head :no_content }
    end
  end

  private


   def set_organisation
      @organisation = Organisation.find(params[:organisation_id])
    end

    # Use callbacks to share common setup or constraints between actions.
    def set_slide_template
      @slide_template = SlideTemplate.find(params[:id])
    end

    # Only allow a list of trusted parameters through.
    def slide_template_params
      params.require(:slide_template).permit(:business_unit_id, :name, :content, :enabled)
    end
end
