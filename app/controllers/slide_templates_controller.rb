class SlideTemplatesController < ApplicationController
  before_action :set_organisation
  before_action :set_slide_template, only: %i[ show edit update destroy ]

  # GET /slide_templates or /slide_templates.json
  def index
    @slide_templates = SlideTemplate.all
  end

  # GET /slide_templates/1 or /slide_templates/1.json
  def show
  end

  # GET /slide_templates/new
  def new
    @slide_template = SlideTemplate.new
    @slide_template.organisation_id = @organisation.id
  end

  # GET /slide_templates/1/edit
  def edit
  end

  # POST /slide_templates or /slide_templates.json
  def create
    @slide_template = SlideTemplate.new(slide_template_params)

    respond_to do |format|
      if @slide_template.save
        format.html { redirect_to organisation_slide_template_url(@organisation, @slide_template), notice: "Slide template was successfully created." }
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
        format.html { redirect_to  organisation_slide_template_url(@organisation, @slide_template), notice: "Slide template was successfully updated." }
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
      format.html { redirect_to organisation_slide_templates_url(@organisation), notice: "Slide template was successfully destroyed." }
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
      params.require(:slide_template).permit(:organisation_id, :name, :content, :enabled)
    end
end
