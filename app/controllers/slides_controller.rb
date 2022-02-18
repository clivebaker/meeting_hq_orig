class SlidesController < ApplicationController
  before_action :set_organisation
  before_action :set_meeting
  before_action :set_slide, only: %i[ show edit update destroy ]

  # GET /slides or /slides.json
  def index
    @slides = Slide.all
  end

  # GET /slides/1 or /slides/1.json
  def show
  end

  # GET /slides/new
  def new
    @slide = Slide.new
  end

  # GET /slides/1/edit
  def edit
  end

  # POST /slides or /slides.json
  def create
    @slide = Slide.new(slide_params)

    respond_to do |format|
      if @slide.save
        format.html { redirect_to slide_url(@slide), notice: "Slide was successfully created." }
        format.json { render :show, status: :created, location: @slide }
      else
        format.html { render :new, status: :unprocessable_entity }
        format.json { render json: @slide.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /slides/1 or /slides/1.json
  def update
    respond_to do |format|
      if @slide.update(slide_params)
        format.html { redirect_to slide_url(@slide), notice: "Slide was successfully updated." }
        format.json { render :show, status: :ok, location: @slide }
      else
        format.html { render :edit, status: :unprocessable_entity }
        format.json { render json: @slide.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /slides/1 or /slides/1.json
  def destroy
    @slide.destroy

    respond_to do |format|
      format.html { redirect_to slides_url, notice: "Slide was successfully destroyed." }
      format.json { head :no_content }
    end
  end

  private

  def set_organisation
    @organisation = Organisation.find(params[:organisation_id])
  end
  
  # Use callbacks to share common setup or constraints between actions.
  def set_meeting
    @meeting = Meeting.find(params[:id])
  end


    # Use callbacks to share common setup or constraints between actions.
    def set_slide
      @slide = Slide.find(params[:id])
    end

    # Only allow a list of trusted parameters through.
    def slide_params
      params.require(:slide).permit(:meeting_id, :name, :slide_template_id, :enabled, :data)
    end
end
